import type { Metadata } from "next";
import "@/styles/global.scss";

export const metadata: Metadata = {
  title: "책의 계절, 동구",
  description:
    "광주 동구의 책 읽기 좋은 공간만 모았어요. 책의 계절, 동구에서 지도 위 추천 장소와 운영시간·정류장·링크까지 깔끔하게 확인하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
