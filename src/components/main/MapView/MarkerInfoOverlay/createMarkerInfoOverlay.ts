import type { Place } from "@/types/place";

import styles from "./MarkerInfoOverlay.module.scss";

type MarkerOverlayOptions = {
  place: Place;
};

export const createMarkerInfoOverlayElement = ({
  place,
}: MarkerOverlayOptions): HTMLElement => {
  const container = document.createElement("div");
  container.className = styles.overlay;
  container.style.pointerEvents = "auto";
  container.tabIndex = 0;

  const title = document.createElement("strong");
  title.className = styles.title;
  title.textContent = place.name;

  const address = document.createElement("p");
  address.className = styles.address;
  address.textContent = place.address;

  container.append(title, address);

  if (place.hours) {
    const hours = document.createElement("p");
    hours.className = styles.hours;
    hours.textContent = place.hours;
    container.append(hours);
  }

  const buttonRow = document.createElement("div");
  buttonRow.className = styles.buttonRow;
  buttonRow.style.pointerEvents = "auto";
  container.append(buttonRow);

  const detailLink = document.createElement("a");
  detailLink.href = `/places/${place.id}`;
  detailLink.className = styles.moreButton;
  detailLink.textContent = "자세히 보기";
  detailLink.style.pointerEvents = "auto";
  detailLink.tabIndex = 0;
  detailLink.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  buttonRow.append(detailLink);

  return container;
};
