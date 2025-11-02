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
};

export type PlacesResponse = {
  places: Place[];
};
