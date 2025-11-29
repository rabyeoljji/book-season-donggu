import { Suspense } from "react";

import MainPage from "@/_pages/MainPage/MainPage";
import LoadingFallback from "@/app/loading";

export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MainPage />
    </Suspense>
  );
}
