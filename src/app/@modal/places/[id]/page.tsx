import PlaceDetailModal from "@/components/main/PlaceDetailModal/PlaceDetailModal";
import { loadPlaces } from "@/app/api/places/data";
import { notFound } from "next/navigation";

type PageParams = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PlaceModalPage({ params }: PageParams) {
  const { id } = await params;
  const placeId = Number(id);

  if (!Number.isInteger(placeId)) {
    notFound();
  }

  const { places } = await loadPlaces();
  const place = places.find((item) => item.id === placeId);

  if (!place) {
    notFound();
  }

  return <PlaceDetailModal place={place} />;
}
