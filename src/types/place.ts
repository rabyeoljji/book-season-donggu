export type PlaceLink = {
  label: string;
  url: string;
};

export type Place = {
  id: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  hours?: string;
  nearbyStops?: string[];
  imageUrl?: string;
  info?: string;
  links?: PlaceLink[];
  tags?: string[];
};

export type PlacesResponse = {
  places: Place[];
};
