"use client";

import type { KakaoNamespace, KakaoWindow } from "@/types/kakao";

const KAKAO_SDK_URL = "https://dapi.kakao.com/v2/maps/sdk.js";
const SCRIPT_ID = "kakao-maps-sdk";

let loadingPromise: Promise<KakaoNamespace> | null = null;

export const loadKakaoMaps = async (): Promise<KakaoNamespace> => {
  if (typeof window === "undefined") {
    throw new Error("Kakao Maps SDK can only be loaded in the browser.");
  }

  const kakaoWindow = window as KakaoWindow;

  if (kakaoWindow.kakao?.maps) {
    return kakaoWindow.kakao;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  const appKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;

  if (!appKey) {
    throw new Error(
      "Kakao Maps JavaScript key (NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY) is missing."
    );
  }

  loadingPromise = new Promise<KakaoNamespace>((resolve, reject) => {
    const existingScript = document.getElementById(
      SCRIPT_ID
    ) as HTMLScriptElement | null;

    if (existingScript) {
      const hasServicesLibrary = existingScript.src.includes("libraries=services");

      if (!hasServicesLibrary) {
        existingScript.remove();
      } else {
        existingScript.addEventListener("load", handleLoad);
        existingScript.addEventListener("error", handleError);
        return;
      }
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `${KAKAO_SDK_URL}?appkey=${appKey}&autoload=false&libraries=services`;

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    document.head.appendChild(script);

    function handleLoad() {
      const { kakao: kakaoNamespace } = window as KakaoWindow;

      if (!kakaoNamespace?.maps?.load) {
        reject(
          new Error("Kakao Maps SDK loaded but kakao.maps.load is unavailable.")
        );
        loadingPromise = null;
        return;
      }

      kakaoNamespace.maps.load(() => {
        const { kakao: loadedKakao } = window as KakaoWindow;

        if (!loadedKakao?.maps) {
          reject(
            new Error("Kakao Maps SDK loaded but kakao.maps is unavailable.")
          );
          loadingPromise = null;
          return;
        }

        if (!loadedKakao.maps.services) {
          reject(
            new Error(
              "Kakao Maps SDK loaded without required services library."
            )
          );
          loadingPromise = null;
          return;
        }

        resolve(loadedKakao as KakaoNamespace);
      });
    }

    function handleError() {
      reject(new Error("Failed to load Kakao Maps SDK."));
      loadingPromise = null;
    }
  });

  return loadingPromise;
};
