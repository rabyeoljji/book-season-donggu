"use client";

import { useMemo, useState } from "react";

import { usePlacesQuery } from "@/api/places.query";
import MapView from "@/components/main/MapView/MapView";
import { neighborhood } from "@/components/main/main.constants";

import styles from "./MainPage.module.scss";
import clsx from "clsx";

const MainPage = () => {
  const { data, isLoading, isError, error } = usePlacesQuery();
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("전체");

  const places = useMemo(() => data?.places ?? [], [data]);

  const filteredPlaces = useMemo(() => {
    if (selectedNeighborhood === "전체") {
      return places;
    }

    return places.filter(({ neighborhood: placeNeighborhood }) => {
      const normalizedNeighborhood = placeNeighborhood ?? "";
      return normalizedNeighborhood === selectedNeighborhood;
    });
  }, [places, selectedNeighborhood]);

  const showLoading = isLoading;
  const showError = isError;
  const showEmptyState =
    !showLoading && !showError && filteredPlaces.length === 0;

  const canShowMap = !showLoading && !showError;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.title}>
          책의 계절, <span>동구</span>
        </h1>
        <p className={styles.description}>
          도서관부터 북카페, 한적한 산책길까지. <br /> 독서와 휴식에 어울리는
          광주 동구의 장소를 직접 선별해 <br /> 지도 위에 담았습니다.
        </p>
      </section>

      <section className={styles.mapSection}>
        <div className={styles.categoryFilter}>
          {neighborhood.map((neighborhoodString) => (
            <button
              key={neighborhoodString}
              type="button"
              aria-pressed={selectedNeighborhood === neighborhoodString}
              className={clsx(
                styles.categoryButton,
                selectedNeighborhood === neighborhoodString && styles.active
              )}
              onClick={() => setSelectedNeighborhood(neighborhoodString)}
            >
              {neighborhoodString}
            </button>
          ))}
        </div>
        <div className={styles.mapContainer}>
          {showLoading && (
            <div className={`${styles.feedback} ${styles.loading}`}>
              장소 정보를 불러오는 중입니다.
            </div>
          )}

          {showError && (
            <div className={`${styles.feedback} ${styles.error}`}>
              장소 정보를 불러오지 못했습니다. {error?.message ?? ""}
            </div>
          )}

          {canShowMap && (
            <>
              <MapView places={filteredPlaces} />
              {showEmptyState && (
                <div className={styles.mapOverlay} role="status" aria-live="polite">
                  선택한 카테고리에 해당하는 장소 정보가 없습니다.
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default MainPage;
