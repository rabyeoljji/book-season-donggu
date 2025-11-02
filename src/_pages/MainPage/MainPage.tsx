"use client";

import { useMemo, useState } from "react";

import { usePlacesQuery } from "@/api/places.query";
import MapView from "@/components/main/MapView/MapView";
import {
  CATEGORY,
  CATEGORY_NAME,
  type CATEGORY_VALUE,
} from "@/components/main/main.enum";
import { category } from "@/components/main/main.constants";

import styles from "./MainPage.module.scss";
import clsx from "clsx";

const MainPage = () => {
  const { data, isLoading, isError, error } = usePlacesQuery();
  const [selectedCategory, setSelectedCategory] = useState<CATEGORY_VALUE>(
    CATEGORY.ALL
  );

  const places = useMemo(() => data?.places ?? [], [data]);

  const filteredPlaces = useMemo(() => {
    if (selectedCategory === CATEGORY.ALL) {
      return places;
    }

    return places.filter(({ category: placeCategory }) => {
      const normalizedCategory = placeCategory ?? CATEGORY.ETC;
      return normalizedCategory === selectedCategory;
    });
  }, [places, selectedCategory]);

  const showLoading = isLoading;
  const showError = isError;
  const showEmpty =
    !showLoading && !showError && data && filteredPlaces.length === 0;

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
          {category.map((categoryKey) => (
            <button
              key={categoryKey}
              type="button"
              aria-pressed={selectedCategory === categoryKey}
              className={clsx(
                styles.categoryButton,
                selectedCategory === categoryKey && styles.active
              )}
              onClick={() => setSelectedCategory(categoryKey)}
            >
              {CATEGORY_NAME[categoryKey]}
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

          {showEmpty && (
            <div className={`${styles.feedback} ${styles.empty}`}>
              선택한 카테고리에 해당하는 장소가 없습니다.
            </div>
          )}

          {!showLoading && !showError && filteredPlaces.length > 0 && (
            <MapView places={filteredPlaces} />
          )}
        </div>
      </section>
    </main>
  );
};

export default MainPage;
