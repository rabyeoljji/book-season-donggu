import { Place, PlacesResponse } from "@/types/place";
import placesData from "../../../../data/places.json";

export async function loadPlaces(): Promise<PlacesResponse> {
  const parsed = placesData as PlacesResponse;

  if (!parsed?.places || !Array.isArray(parsed.places)) {
    throw new Error("Invalid places data format");
  }

  return {
    places: parsed.places.map((place) => normalizePlace(place)),
  };
}

const normalizePlace = (place: Place): Place => ({
  ...place,
  nearbyStops: place.nearbyStops ?? [],
  images: place.images ?? (place.imageUrl ? [place.imageUrl] : []),
  links: place.links ?? [],
  tags: place.tags ?? [],
});
