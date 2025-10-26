"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useRouter } from "next/navigation";

import type { Place } from "@/types/place";

import styles from "./PlaceDetailModal.module.scss";

type PlaceDetailContentProps = { place: Place };

export const PlaceDetailHeader = ({
  place,
  variant = "page",
}: PlaceDetailContentProps & { variant?: "page" | "modal" }) => {
  if (variant === "modal") {
    return (
      <header className={styles.header}>
        <Dialog.Title className={styles.title}>{place.name}</Dialog.Title>
        <Dialog.Description className={styles.address}>
          {place.address}
        </Dialog.Description>
      </header>
    );
  }

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{place.name}</h1>
      <p className={styles.address}>{place.address}</p>
    </header>
  );
};

export const PlaceDetailContent = ({ place }: PlaceDetailContentProps) => (
  <>
    {!!place.images?.length && (
      <div className={styles.imageGrid}>
        {place.images.map((image, index) => (
          <div key={`${place.id}-detail-${index}`} className={styles.imageItem}>
            <Image
              src={image}
              alt={`${place.name} 이미지 ${index + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 320px"
            />
          </div>
        ))}
      </div>
    )}

    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>기본 정보</h3>
      <dl className={styles.metaList}>
        {place.hours && (
          <div className={styles.metaRow}>
            <dt>운영 시간</dt>
            <dd>{place.hours}</dd>
          </div>
        )}
        {!!place.nearbyStops?.length && (
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
        {!!place.tags?.length && (
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
        )}
      </dl>
    </section>

    {place.info && (
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>공간 소개</h3>
        <p className={styles.infoBox}>{place.info}</p>
      </section>
    )}

    {!!place.links?.length && (
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
  place: Place;
};

const PlaceDetailModal = ({ place }: PlaceDetailModalProps) => {
  const router = useRouter();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.back();
    }
  };

  return (
    <Dialog.Root open onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <Dialog.Close className={styles.closeButton} aria-label="닫기">
            ×
          </Dialog.Close>
          <PlaceDetailHeader place={place} variant="modal" />
          <PlaceDetailContent place={place} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PlaceDetailModal;
