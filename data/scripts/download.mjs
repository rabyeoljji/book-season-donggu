#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  createSheetsClient,
  getSheetTitle,
  parseArrayCell,
  parseLinksCell,
  parseBooleanCell,
} from "../utils/index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLACES_PATH = path.join(__dirname, "..", "places.json");

function formatTimestamp(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

async function backupPlaces() {
  try {
    await fs.promises.access(PLACES_PATH, fs.constants.F_OK);
  } catch (error) {
    if (error.code === "ENOENT") return undefined;
    throw error;
  }

  const backupName = `places-${formatTimestamp(new Date())}.json`;
  const backupPath = path.join(path.dirname(PLACES_PATH), backupName);
  await fs.promises.copyFile(PLACES_PATH, backupPath);
  return backupPath;
}

function buildPlaceFromRow(row) {
  const [
    id,
    name,
    address,
    hours,
    closedDays,
    nearbyStopsCell,
    infoCell,
    forbiddenCell,
    tagsCell,
    category,
    neighborhood,
    oneLineReview,
    imagesCell,
    imageSource,
    linksCell,
    disabledCell,
  ] = row;

  const place = {};

  if (id !== undefined && id !== null && `${id}`.trim() !== "") {
    const parsedId = Number(id);
    place.id = Number.isFinite(parsedId) ? parsedId : id;
  }
  if (name) place.name = name;
  if (address) place.address = address;
  if (hours) place.hours = hours;
  if (closedDays) place.closedDays = closedDays;

  const nearbyStops = parseArrayCell(nearbyStopsCell);
  if (nearbyStops) place.nearbyStops = nearbyStops;

  const info = parseArrayCell(infoCell);
  if (info) place.info = info;

  const forbidden = parseArrayCell(forbiddenCell);
  if (forbidden) place.forbidden = forbidden;

  const tags = parseArrayCell(tagsCell);
  if (tags) place.tags = tags;

  if (category) place.category = category;
  if (neighborhood) place.neighborhood = neighborhood;
  if (oneLineReview) place.oneLineReview = oneLineReview;

  const images = parseArrayCell(imagesCell);
  if (images) place.images = images;

  if (imageSource) place.imageSource = imageSource;

  const links = parseLinksCell(linksCell);
  if (links) place.links = links;

  const disabled = parseBooleanCell(disabledCell);
  if (disabled !== undefined) place.disabled = disabled;

  return place;
}

async function download() {
  const { sheets, docId, sheetId } = createSheetsClient();
  const sheetTitle = await getSheetTitle(sheets, docId, sheetId);
  const range = `${sheetTitle}!A2:P`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: docId,
    range,
  });

  const rows = res.data.values || [];

  const places = rows
    .map((row) => buildPlaceFromRow(row))
    .filter((place) => Object.keys(place).length > 0);

  const backupPath = await backupPlaces();

  await fs.promises.writeFile(
    PLACES_PATH,
    JSON.stringify({ places }, null, 2),
    "utf8",
  );

  return { count: places.length, backupPath };
}

download()
  .then(({ count, backupPath }) => {
    if (backupPath) {
      console.log(`기존 places.json 백업 완료: ${backupPath}`);
    }
    console.log(`스프레드시트에서 ${count}건을 다운로드하여 places.json을 갱신했습니다.`);
  })
  .catch((error) => {
    console.error("스프레드시트 다운로드 실패:", error.message);
    process.exitCode = 1;
  });
