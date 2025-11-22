import PlaceDetailModal from "@/components/main/PlaceDetailModal/PlaceDetailModal";
import { loadPlaces } from "@/app/api/places/data";
import { notFound } from "next/navigation";

type PageParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateStaticParams() {
  const { places } = await loadPlaces();

  return places.map((place) => ({
    id: place.id.toString(),
  }));
}

export default async function PlaceModalPage({ params }: PageParams) {
  const { id } = await params;
  const placeId = Number(id);

  if (!Number.isInteger(placeId)) {
    notFound();
  }

  return <PlaceDetailModal id={placeId} />;
}
