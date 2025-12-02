#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  createSheetsClient,
  getSheetTitle,
  stringifyArray,
  stringifyLinks,
} from "../utils/index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLACES_PATH = path.join(__dirname, "..", "places.json");

async function loadPlaces() {
  const raw = await fs.promises.readFile(PLACES_PATH, "utf8");
  const parsed = JSON.parse(raw);
  if (!parsed.places || !Array.isArray(parsed.places)) {
    throw new Error("places.json 형식이 올바르지 않습니다. { places: [] } 형태여야 합니다.");
  }
  return parsed.places;
}

function toRow(place) {
  return [
    place.id ?? "",
    place.name ?? "",
    place.address ?? "",
    place.hours ?? "",
    place.closedDays ?? "",
    stringifyArray(place.nearbyStops),
    stringifyArray(place.info),
    stringifyArray(place.forbidden),
    stringifyArray(place.tags),
    place.category ?? "",
    place.neighborhood ?? "",
    place.oneLineReview ?? "",
    stringifyArray(place.images),
    place.imageSource ?? "",
    stringifyLinks(place.links),
    place.disabled === undefined ? "" : String(place.disabled),
  ];
}

async function upload() {
  const places = await loadPlaces();
  const { sheets, docId, sheetId } = createSheetsClient();
  const sheetTitle = await getSheetTitle(sheets, docId, sheetId);
  const range = `${sheetTitle}!A2:P`;

  const values = places.map(toRow);

  // 기존 데이터 제거 후 새 데이터 쓰기
  await sheets.spreadsheets.values.clear({
    spreadsheetId: docId,
    range,
  });

  if (values.length === 0) {
    return;
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: docId,
    range,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

upload()
  .then(() => {
    console.log("스프레드시트 업로드 완료");
  })
  .catch((error) => {
    console.error("스프레드시트 업로드 실패:", error.message);
    process.exitCode = 1;
  });
