"use client";

import { usePlacesQuery } from "@/api/places.query";
import MapView from "@/components/main/MapView/MapView";

import styles from "./MainPage.module.scss";

const MainPage = () => {
  const { data, isLoading, isError, error } = usePlacesQuery();

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
        <div className={styles.mapContainer}>
          {isLoading && (
            <div className={`${styles.feedback} ${styles.loading}`}>
              장소 정보를 불러오는 중입니다.
            </div>
          )}

          {isError && (
            <div className={`${styles.feedback} ${styles.error}`}>
              장소 정보를 불러오지 못했습니다. {error?.message ?? ""}
            </div>
          )}

          {data?.places && <MapView places={data.places} />}
        </div>
      </section>
    </main>
  );
};

export default MainPage;
