import type { Metadata } from "next";
import "@/styles/global.scss";
import Providers from "@/app/providers";

export const metadata: Metadata = {
  title: "책의 계절, 동구",
  description:
    "광주 동구의 책 읽기 좋은 공간만 모았어요. 책의 계절, 동구에서 지도 위 추천 장소와 운영시간·정류장·링크까지 깔끔하게 확인하세요.",
  icons: {
    icon: [
      { url: "/src/assets/favicon/favicon.ico" },
      { url: "/src/assets/favicon/icon0.svg", type: "image/svg+xml" },
      {
        url: "/src/assets/favicon/icon1.png",
        type: "image/png",
        sizes: "96x96",
      },
      {
        url: "/web-app-manifest-192x192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: "/web-app-manifest-512x512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: [{ url: "/favicon.ico" }],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          {children}
          {modal}
        </Providers>
      </body>
    </html>
  );
}
