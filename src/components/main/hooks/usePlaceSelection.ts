import { Place } from "@/types/place";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

export const usePlaceSelection = (places: Place[]) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const placeParam = useMemo(() => searchParams.get("place"), [searchParams]);
  const selectedPlaceId = useMemo(() => {
    if (!placeParam) return null;
    const parsedId = Number(placeParam);
    return Number.isInteger(parsedId) ? parsedId : null;
  }, [placeParam]);

  const selectedPlace = useMemo(
    () =>
      placeParam
        ? places.find(({ id, disabled }) => id === selectedPlaceId && !disabled) ??
          null
        : null,
    [placeParam, places, selectedPlaceId]
  );

  const updatePlaceSearchParam = useCallback(
    (placeId: number | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (placeId == null) {
        params.delete("place");
      } else {
        params.set("place", placeId.toString());
      }

      const queryString = params.toString();
      const nextPath = queryString ? `${pathname}?${queryString}` : pathname;

      router.replace(nextPath, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const handlePlaceSelect = useCallback(
    (placeId: number) => {
      updatePlaceSearchParam(placeId);
    },
    [updatePlaceSearchParam]
  );

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (open) return;
      updatePlaceSearchParam(null);
    },
    [updatePlaceSearchParam]
  );

  useEffect(() => {
    if (!placeParam) return;

    const hasInvalidId = selectedPlaceId == null;
    const exists = places.some(
      (place) => place.id === selectedPlaceId && !place.disabled
    );

    if (hasInvalidId || (places.length > 0 && !exists)) {
      alert("등록되지 않은 장소 정보입니다.");
      updatePlaceSearchParam(null);
    }
  }, [placeParam, places, selectedPlaceId, updatePlaceSearchParam]);

  return {
    selectedPlace,
    handlePlaceSelect,
    handleDialogOpenChange,
  };
};
