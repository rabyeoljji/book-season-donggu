import { Place, PlacesResponse } from "@/types/place";
import fs from "node:fs/promises";
import path from "node:path";

const dataFilePath = path.join(process.cwd(), "data", "places.json");

export async function loadPlaces(): Promise<PlacesResponse> {
  const fileContents = await fs.readFile(dataFilePath, "utf-8");
  const parsed = JSON.parse(fileContents) as PlacesResponse;

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
  links: place.links ?? [],
  tags: place.tags ?? [],
});
