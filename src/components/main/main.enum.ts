export const CATEGORY = {
  ALL: "ALL",
  CAFE: "CAFE",
  LIBRARY: "LIBRARY",
  OUTDOOR: "OUTDOOR",
  ETC: "ETC",
} as const;

export type CATEGORY_KEY = keyof typeof CATEGORY;
export type CATEGORY_VALUE = (typeof CATEGORY)[CATEGORY_KEY];

export const CATEGORY_NAME = {
  [CATEGORY.ALL]: "전체",
  [CATEGORY.CAFE]: "북카페·카페",
  [CATEGORY.LIBRARY]: "도서관",
  [CATEGORY.OUTDOOR]: "야외",
  [CATEGORY.ETC]: "기타",
} as const;
