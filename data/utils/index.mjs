import fs from "fs";
import path from "path";
import { google } from "googleapis";

const DEFAULT_DOC_ID = "1PDZo4vkWOju9-VhjERafqTi0JGp7zj9A51CQ9DazRXw";
const DEFAULT_SHEET_ID = 0;
const DEFAULT_CREDENTIALS_FILENAME = "book-season-donggu-b47c7b9b5526.json";
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

function loadCredentials() {
  const credentialsPath =
    process.env.GOOGLE_CREDENTIALS_PATH ||
    path.join(process.cwd(), DEFAULT_CREDENTIALS_FILENAME);

  if (!fs.existsSync(credentialsPath)) {
    throw new Error(
      `서비스 계정 키 파일을 찾을 수 없습니다: ${credentialsPath}\nGOOGLE_CREDENTIALS_PATH 환경변수로 경로를 지정할 수 있습니다.`,
    );
  }

  const credentialsRaw = fs.readFileSync(credentialsPath, "utf8");
  const credentials = JSON.parse(credentialsRaw);

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error(
      "서비스 계정 키 파일에 client_email 혹은 private_key가 없습니다.",
    );
  }

  return credentials;
}

function createSheetsClient() {
  const credentials = loadCredentials();

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: "v4", auth });
  const docId = process.env.GOOGLE_SHEETS_DOC_ID || DEFAULT_DOC_ID;
  const sheetId = Number(
    process.env.GOOGLE_SHEETS_SHEET_ID ?? DEFAULT_SHEET_ID,
  );

  return { sheets, docId, sheetId };
}

async function getSheetTitle(sheets, docId, sheetId) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: docId });
  const targetSheet = meta.data.sheets?.find(
    (sheet) => sheet.properties?.sheetId === sheetId,
  );

  if (!targetSheet?.properties?.title) {
    throw new Error(`sheetId ${sheetId}에 해당하는 시트를 찾을 수 없습니다.`);
  }

  return targetSheet.properties.title;
}

function stringifyArray(values) {
  const list = Array.isArray(values)
    ? values
    : typeof values === "string" && values.trim()
      ? [values]
      : [];

  if (list.length === 0) {
    return "";
  }

  const escaped = list.map((value) =>
    String(value ?? "")
      .replace(/"/g, '\\"')
      .trim(),
  );

  return escaped.map((value) => `"${value}"`).join(", ");
}

function stringifyLinks(links) {
  if (!links || !Array.isArray(links) || links.length === 0) {
    return "";
  }

  return links
    .map((link) => {
      const label = String(link.label ?? "")
        .replace(/"/g, '\\"')
        .trim();
      const url = String(link.url ?? "")
        .replace(/"/g, '\\"')
        .trim();
      if (!label && !url) return "";
      return `{label:"${label}", url:"${url}"}`;
    })
    .filter(Boolean)
    .join(", ");
}

function parseArrayCell(cell) {
  if (!cell) return undefined;

  const items = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < cell.length; i += 1) {
    const char = cell[i];
    if (char === '"' && cell[i - 1] !== "\\") {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      items.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  if (current.length > 0) items.push(current);

  const cleaned = items
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.replace(/^"|"$/g, "").replace(/\\"/g, '"'))
    .filter((part) => part.length > 0);

  return cleaned.length ? cleaned : undefined;
}

function parseLinksCell(cell) {
  if (!cell) return undefined;

  const chunks = cell
    .split("},")
    .map((part) => part.replace(/[{}]/g, "").trim())
    .filter(Boolean);

  const links = chunks
    .map((chunk) => {
      const labelMatch = chunk.match(/label:"([^"]*)"/);
      const urlMatch = chunk.match(/url:"([^"]*)"/);
      const label = labelMatch?.[1]?.replace(/\\"/g, '"') ?? "";
      const url = urlMatch?.[1]?.replace(/\\"/g, '"') ?? "";
      if (!label && !url) return null;
      return { label, url };
    })
    .filter(Boolean);

  return links.length ? links : undefined;
}

function parseBooleanCell(cell) {
  if (cell === undefined || cell === null) return undefined;
  const normalized = String(cell).trim().toLowerCase();
  if (!normalized) return undefined;
  return normalized === "true" || normalized === "1" || normalized === "y";
}

export {
  createSheetsClient,
  getSheetTitle,
  stringifyArray,
  stringifyLinks,
  parseArrayCell,
  parseLinksCell,
  parseBooleanCell,
};
