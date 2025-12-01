"use client";

import Image from "next/image";
import { useState } from "react";
import { useKeenSlider } from "keen-slider/react";

import type { Place } from "@/types/place";

import styles from "./PlaceDetailImagesSlider.module.scss";

type PlaceDetailImagesSliderProps = { place?: Place };

const PlaceDetailImagesSlider = ({ place }: PlaceDetailImagesSliderProps) => {
  const images = place?.images ?? [];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    loop: true,
    slideChanged: (slider) => setCurrentSlide(slider.track.details.rel),
    created: () => setLoaded(true),
  });

  return (
    <div className={styles.imageContainer}>
      {!!images.length && (
        <div className={styles.sliderWrapper}>
          <div
            ref={sliderRef}
            className={`keen-slider ${styles.slider}`}
            aria-label={`${place?.name} 이미지 슬라이더`}
          >
            {images.map((image, index) => (
              <div
                key={`${place?.id}-detail-${index}`}
                className={`keen-slider__slide ${styles.slide}`}
              >
                <Image
                  src={image}
                  alt={`${place?.name} 이미지 ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </div>
            ))}
          </div>
          {loaded && images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="이전 이미지"
                className={`${styles.navButton} ${styles.navButtonPrev}`}
                onClick={() => instanceRef.current?.prev()}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="다음 이미지"
                className={`${styles.navButton} ${styles.navButtonNext}`}
                onClick={() => instanceRef.current?.next()}
              >
                ›
              </button>
            </>
          )}
          {loaded && images.length > 1 && (
            <div className={styles.dots}>
              {images.map((_, index) => (
                <button
                  key={`${place?.id}-dot-${index}`}
                  type="button"
                  aria-label={`${place?.name} 이미지 ${index + 1}번으로 이동`}
                  className={`${styles.dot} ${
                    currentSlide === index ? styles.activeDot : ""
                  }`}
                  onClick={() => instanceRef.current?.moveToIdx(index)}
                />
              ))}
            </div>
          )}
        </div>
      )}
      {place?.imageSource && (
        <p className={styles.imageSource}>사진 출처 : {place.imageSource}</p>
      )}
    </div>
  );
};

export default PlaceDetailImagesSlider;
