import { NextResponse } from "next/server";

import { loadPlaces } from "../data";

const CACHE_CONTROL_HEADER = "s-maxage=600, stale-while-revalidate=86400";

type RouteParams = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const data = await loadPlaces();
    const place = data.places.find((entry) => entry.id === params.id);

    if (!place) {
      return NextResponse.json(
        { message: "Place not found" },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(place, {
      headers: {
        "cache-control": CACHE_CONTROL_HEADER,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to load place",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
