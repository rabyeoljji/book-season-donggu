import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import type { Place, PlacesResponse } from "@/types/place";
import { ApiError } from "@/common/utils/fetchClient";

import { getPlaceById, getPlaces } from "./places.api";

export const placesQueryKeys = {
  ALL: ["places"] as const,
  DETAIL: (id: number | null) => ["places", id] as const,
};

type PlacesQueryKey = typeof placesQueryKeys.ALL;
type PlaceDetailQueryKey = ReturnType<typeof placesQueryKeys.DETAIL>;

type PlacesQueryOptions<TData = PlacesResponse> = Omit<
  UseQueryOptions<PlacesResponse, ApiError, TData, PlacesQueryKey>,
  "queryKey" | "queryFn"
>;

export const usePlacesQuery = <TData = PlacesResponse>(
  options?: PlacesQueryOptions<TData>
): UseQueryResult<TData, ApiError> =>
  useQuery({
    queryKey: placesQueryKeys.ALL,
    queryFn: getPlaces,
    ...options,
  });

type PlaceQueryOptions<TData = Place> = Omit<
  UseQueryOptions<Place, ApiError, TData, PlaceDetailQueryKey>,
  "queryKey" | "queryFn" | "enabled"
>;

export const usePlaceQuery = <TData = Place>(
  id: number | null,
  options?: PlaceQueryOptions<TData>
): UseQueryResult<TData, ApiError> =>
  useQuery({
    queryKey: placesQueryKeys.DETAIL(id),
    queryFn: () => {
      if (id == null) {
        throw new Error("Place id is required");
      }
      return getPlaceById(id);
    },
    enabled: id != null,
    ...options,
  });
