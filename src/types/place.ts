import { CATEGORY_VALUE } from "@/components/main/main.enum";

export type PlaceLink = {
  label: string;
  url: string;
};

export type Place = {
  id: number;
  name: string;
  address: string;
  hours?: string;
  closedDays?: string;
  nearbyStops?: string[];
  imageUrl?: string;
  images?: string[];
  info?: string[];
  forbidden?: string;
  links?: PlaceLink[];
  tags?: string[];
  category?: CATEGORY_VALUE;
  imageSource?: string;
};

export type PlacesResponse = {
  places: Place[];
};
