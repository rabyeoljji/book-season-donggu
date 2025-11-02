"use client";

import { useEffect, useRef, useState } from "react";

import { loadKakaoMaps } from "@/common/utils/loadKakaoMaps";
import type {
  KakaoCustomOverlay,
  KakaoLatLng,
  KakaoMap,
  KakaoMapsNamespace,
  KakaoMarker,
  KakaoNamespace,
} from "@/types/kakao";
import type { Place } from "@/types/place";

import { createMarkerInfoOverlayElement } from "./MarkerInfoOverlay/createMarkerInfoOverlay";
import styles from "./MapView.module.scss";

type MapViewProps = {
  places: Place[];
};

const DEFAULT_CENTER = {
  lat: 35.14224, // 광주 조선대학교 인근 좌표
  lng: 126.9333,
};

const sdkErrorMessage =
  "카카오 지도를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";

const geocodeErrorMessage =
  "등록된 주소의 위치를 찾지 못했습니다. 주소 정보를 다시 확인해 주세요.";

const createLatLng = (
  maps: KakaoMapsNamespace,
  lat: number,
  lng: number
): KakaoLatLng => new maps.LatLng(lat, lng);

export default function MapView({ places }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const overlayRef = useRef<KakaoCustomOverlay | null>(null);

  const ensureOverlayVisible = (
    maps: KakaoMapsNamespace,
    map: KakaoMap,
    content: HTMLElement
  ) => {
    if (!containerRef.current) return;

    const PADDING = 16;

    window.requestAnimationFrame(() => {
      if (!containerRef.current) return;

      const mapRect = containerRef.current.getBoundingClientRect();
      const overlayRect = content.getBoundingClientRect();

      let shiftX = 0;
      let shiftY = 0;

      if (overlayRect.left < mapRect.left + PADDING) {
        shiftX = overlayRect.left - (mapRect.left + PADDING);
      } else if (overlayRect.right > mapRect.right - PADDING) {
        shiftX = overlayRect.right - (mapRect.right - PADDING);
      }

      if (overlayRect.top < mapRect.top + PADDING) {
        shiftY = overlayRect.top - (mapRect.top + PADDING);
      } else if (overlayRect.bottom > mapRect.bottom - PADDING) {
        shiftY = overlayRect.bottom - (mapRect.bottom - PADDING);
      }

      if (shiftX === 0 && shiftY === 0) {
        return;
      }

      const projection = map.getProjection();
      if (!projection) {
        return;
      }

      const center = map.getCenter();
      const centerPoint = projection.containerPointFromCoords(center);
      const nextPoint = new maps.Point(
        centerPoint.x + shiftX,
        centerPoint.y + shiftY
      );
      const nextCenter = projection.coordsFromContainerPoint(nextPoint);

      map.panTo(nextCenter);
    });
  };

  useEffect(() => {
    let isUnmounted = false;
    let mapInstance: KakaoMap | null = null;
    const markers: KakaoMarker[] = [];

    const initializeMap = async () => {
      if (!containerRef.current) return;

      try {
        await loadKakaoMaps();
        if (isUnmounted || !containerRef.current) return;

        const { kakao } = window as typeof window & { kakao: KakaoNamespace };

        if (!kakao?.maps || !kakao.maps.services) {
          throw new Error("카카오 지도 객체를 찾을 수 없습니다.");
        }

        setLoadError(null);

        const maps = kakao.maps;
        const defaultCenter = createLatLng(
          maps,
          DEFAULT_CENTER.lat,
          DEFAULT_CENTER.lng
        );

        mapInstance = new maps.Map(containerRef.current, {
          center: defaultCenter,
        });

        const geocoder = new maps.services.Geocoder();
        const bounds = new maps.LatLngBounds();
        const geocodePromises = places.map(
          (place) =>
            new Promise<void>((resolve) => {
              geocoder.addressSearch(
                place.address,
                (results, status: string) => {
                  if (isUnmounted || !Array.isArray(results) || !mapInstance) {
                    resolve();
                    return;
                  }

                  if (status !== maps.services.Status.OK || !results[0]) {
                    resolve();
                    return;
                  }

                  const { x, y } = results[0];
                  const lat = Number(y);
                  const lng = Number(x);

                  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                    resolve();
                    return;
                  }

                  const position = createLatLng(maps, lat, lng);
                  const marker = new maps.Marker({
                    position,
                    map: mapInstance ?? undefined,
                    title: place.name,
                  });

                  markers.push(marker);
                  bounds.extend(position);

                  maps.event.addListener(marker, "click", () => {
                    if (!mapInstance) return;

                    if (overlayRef.current) {
                      overlayRef.current.setMap(null);
                    }

                    const content = createMarkerInfoOverlayElement({ place });
                    maps.event.preventMap(content);
                    const overlay = new maps.CustomOverlay({
                      position,
                      yAnchor: 1.1,
                      content,
                      clickable: true,
                    });

                    overlay.setMap(mapInstance);
                    overlayRef.current = overlay;
                    const anchorEl = content.querySelector("a");
                    if (anchorEl instanceof HTMLElement) {
                      maps.event.preventMap(anchorEl);
                      anchorEl.addEventListener("click", (domEvent) =>
                        domEvent.stopPropagation()
                      );
                    }
                    ensureOverlayVisible(maps, mapInstance, content);
                  });

                  resolve();
                }
              );
            })
        );

        await Promise.all(geocodePromises);

        if (isUnmounted || !mapInstance) {
          return;
        }

        maps.event.addListener(mapInstance, "click", () => {
          if (overlayRef.current) {
            overlayRef.current.setMap(null);
            overlayRef.current = null;
          }
        });

        if (markers.length === 0) {
          setLoadError(geocodeErrorMessage);
          mapInstance.setCenter(defaultCenter);
          return;
        }

        if (markers.length === 1) {
          const singlePosition = markers[0].getPosition();
          if (singlePosition) {
            mapInstance.setCenter(singlePosition);
          }
          mapInstance.setLevel(2);
          return;
        }

        mapInstance.setBounds(bounds);
      } catch (error) {
        console.error(error);
        if (!isUnmounted) {
          setLoadError(sdkErrorMessage);
        }
      }
    };

    initializeMap();

    return () => {
      isUnmounted = true;
      markers.forEach((marker) => marker.setMap(null));
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
        overlayRef.current = null;
      }
      mapInstance = null;
    };
  }, [places]);

  if (loadError) {
    return <div className={styles.error}>{loadError}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={styles.map}
      aria-label="책의 계절, 동구 지도"
    />
  );
}
