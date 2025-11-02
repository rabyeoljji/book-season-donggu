import { NextResponse } from "next/server";

import { loadPlaces } from "./data";

const CACHE_CONTROL_HEADER = "s-maxage=600, stale-while-revalidate=86400";

export async function GET() {
  try {
    const data = await loadPlaces();
    return NextResponse.json(data, {
      headers: {
        "cache-control": CACHE_CONTROL_HEADER,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to load places",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
