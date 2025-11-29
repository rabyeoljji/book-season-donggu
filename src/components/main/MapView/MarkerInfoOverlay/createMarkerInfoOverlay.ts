import type { Place } from "@/types/place";

import styles from "./MarkerInfoOverlay.module.scss";

type MarkerOverlayOptions = {
  place: Place;
  onDetailClick?: (placeId: number) => void;
};

export const createMarkerInfoOverlayElement = ({
  place,
  onDetailClick,
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
  if (place.closedDays) {
    const closedDays = document.createElement("p");
    closedDays.className = styles.closedDays;
    closedDays.textContent = place.closedDays;
    container.append(closedDays);
  }

  const buttonRow = document.createElement("div");
  buttonRow.className = styles.buttonRow;
  buttonRow.style.pointerEvents = "auto";
  container.append(buttonRow);

  const detailButton = document.createElement("button");
  detailButton.type = "button";
  detailButton.className = styles.moreButton;
  detailButton.textContent = "자세히 보기";
  detailButton.style.pointerEvents = "auto";
  detailButton.tabIndex = 0;
  detailButton.addEventListener("click", (event) => {
    event.stopPropagation();
    onDetailClick?.(place.id);
  });

  buttonRow.append(detailButton);

  return container;
};
