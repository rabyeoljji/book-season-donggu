import { API_BASE_URL } from "@/api";
import { fetchClient } from "@/common/utils/fetchClient";
import type { Place, PlacesResponse } from "@/types/place";

const API_URL = `${API_BASE_URL}/api/places`;

export const getPlaces = () => fetchClient<PlacesResponse>(API_URL);

export const getPlaceById = (id: number) =>
  fetchClient<Place>(`${API_URL}/${id}`);
