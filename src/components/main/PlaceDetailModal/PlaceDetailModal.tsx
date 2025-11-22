"use client";

import * as Dialog from "@radix-ui/react-dialog";
import dynamic from "next/dynamic";
import { notFound, useRouter } from "next/navigation";
import { useState } from "react";

import { usePlaceQuery } from "@/api/places.query";
import type { Place } from "@/types/place";

import styles from "./PlaceDetailModal.module.scss";

const PlaceDetailImages = dynamic(
  () => import("./PlaceDetailImagesSlider/PlaceDetailImagesSlider"),
  {
    ssr: false,
    loading: () => (
      <div className={styles.imageContainer} aria-label="이미지 로딩 중">
        <div className={styles.LoadingImage}>이미지 로딩 중</div>
      </div>
    ),
  }
);

type PlaceDetailContentProps = { place?: Place };

export const PlaceDetailContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className={styles.infoContainer}>{children}</div>;
};

export const PlaceDetailHeader = ({
  place,
  variant = "page",
}: PlaceDetailContentProps & { variant?: "page" | "modal" }) => {
  if (variant === "modal") {
    return (
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <Dialog.Title className={styles.title}>{place?.name}</Dialog.Title>
          <Dialog.Description className={styles.address}>
            {place?.address}
          </Dialog.Description>
        </div>
        {place?.oneLineReview && (
          <div className={styles.reviewBubbleContainer}>
            <span>👱🏻‍♀️👱🏻‍♂️</span>
            <div className={styles.reviewBubbleWrapper}>
              <div className={styles.reviewBubbleBody}>
                {place.oneLineReview}
              </div>
              <div className={styles.reviewBubbleTail} />
            </div>
          </div>
        )}
      </header>
    );
  }

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{place?.name}</h1>
      <p className={styles.address}>{place?.address}</p>
    </header>
  );
};

export const PlaceDetailContent = ({ place }: PlaceDetailContentProps) => (
  <>
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>🔍 기본 정보</h3>
      <dl className={styles.metaList}>
        {place?.hours && (
          <div className={styles.metaRow}>
            <dt>운영 시간</dt>
            <dd>{place?.hours}</dd>
          </div>
        )}
        {place?.closedDays && (
          <div className={styles.metaRow}>
            <dt>휴무</dt>
            <dd>{place?.closedDays}</dd>
          </div>
        )}
        {!!place?.nearbyStops?.length && (
          <div className={styles.metaRow}>
            <dt>주변 정류장</dt>
            <dd className={styles.chipList}>
              {place.nearbyStops.map((stop) => (
                <span key={stop} className={styles.chip}>
                  {stop}
                </span>
              ))}
            </dd>
          </div>
        )}
        {!!place?.tags?.length && (
          <>
            <div className={styles.line} />
            <div className={styles.metaRow}>
              <dt>태그</dt>
              <dd className={styles.chipList}>
                {place.tags.map((tag) => (
                  <span key={tag} className={styles.chip}>
                    #{tag}
                  </span>
                ))}
              </dd>
            </div>
          </>
        )}
      </dl>
    </section>

    {place?.info && (
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>💡 공간 소개</h3>
        <div className={styles.infoBox}>
          {place?.info.map((info) => (
            <p key={info}>· {info}</p>
          ))}
        </div>
      </section>
    )}

    {place?.forbidden && (
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>🚫 금지 사항</h3>
        <div className={styles.infoBox}>{place.forbidden}</div>
      </section>
    )}

    {!!place?.links?.length && (
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>관련 링크</h3>
        <div className={styles.linkList}>
          {place.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className={styles.linkItem}
            >
              {link.label}
            </a>
          ))}
        </div>
      </section>
    )}
  </>
);

type PlaceDetailModalProps = {
  id: number;
};

const PlaceDetailModal = ({ id }: PlaceDetailModalProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const { data: place, isError } = usePlaceQuery(id);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (open) {
      return;
    }

    if (typeof window === "undefined") {
      router.replace("/");
      return;
    }

    const state = window.history.state as { idx?: number } | null;
    const hasNextHistory = typeof state?.idx === "number" && state.idx > 0;
    const hasInternalReferrer =
      Boolean(document.referrer) &&
      document.referrer.startsWith(window.location.origin);

    if (hasNextHistory || hasInternalReferrer) {
      router.back();
      return;
    }

    router.replace("/");
  };

  if (isError) {
    notFound();
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <Dialog.Close className={styles.closeButton} aria-label="닫기">
            ×
          </Dialog.Close>
          <PlaceDetailImages place={place} />
          <PlaceDetailContainer>
            <PlaceDetailHeader place={place} variant="modal" />
            <PlaceDetailContent place={place} />
          </PlaceDetailContainer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PlaceDetailModal;
