# 책의 계절, 동구

광주 동구의 책 읽기 좋은 장소를 지도 기반으로 탐색할 수 있는 Next.js 애플리케이션입니다.
도서관, 북카페, 산책 공간 등 큐레이션된 장소 정보를 한눈에 확인하고, 상세 모달을 통해 운영 정보와 주변 정류장, 관련 링크 등을 빠르게 살펴볼 수 있습니다.

## 주요 기능

- **지도 기반 탐색**: 카카오 지도 SDK를 지연 로딩해 장소 주소를 지오코딩하고, 마커·커스텀 오버레이를 활용해 장소 정보를 제공합니다.
- **상세 모달**: 마커 클릭 또는 공유 가능한 라우트를 통해 Radix Dialog 기반 장소 상세 모달을 표시합니다.
- **데이터 파이프라인**: `data/places.json` → Next.js API Route → React Query 훅으로 이어지는 데이터 흐름을 구축했습니다.
- **안정적인 데이터 페칭**: 커스텀 `fetchClient`와 재시도 정책을 갖춘 `QueryClient`로 네트워크 오류에 유연하게 대응합니다.
- **풍부한 에셋**: 장소별 이미지와 랜딩 히어로 일러스트를 통해 시각적 몰입도를 높였습니다.

## 기술 스택

- **프론트엔드**: Next.js 15 (App Router), React 19, TypeScript
- **상태 / 데이터**: React Query, Radix UI Dialog
- **스타일링**: SCSS Modules, 전역 타이포그래피 변수
- **기타**: Kakao Maps JavaScript SDK, PNPM (권장 패키지 매니저)

## 폴더 구조

```
book-season-donggu/
├── data/
│   └── places.json          # 장소 데이터셋
├── public/
│   └── images/              # 랜딩 및 장소 이미지
├── src/
│   ├── _pages/              # 페이지 전용 컴포넌트 (MainPage 등)
│   ├── api/                 # 클라이언트 API 래퍼 및 React Query 훅
│   ├── app/                 # Next.js App Router 폴더 구조 및 인터셉팅 라우트
│   ├── common/              # 공용 유틸리티 및 QueryClient
│   ├── components/          # UI 컴포넌트 (MapView, PlaceDetailModal 등)
│   ├── styles/              # 전역 스타일, 변수, 리셋
│   └── types/               # TypeScript 타입 정의
└── README.md
```

## 환경 변수

프로젝트 루트에 `.env.local`(또는 `.env`) 파일을 생성하고 다음 값을 설정하세요.

```bash
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
NEXT_PUBLIC_BASE_URL_DEV   # 개발용 (선택 사항)
NEXT_PUBLIC_BASE_URL_PROD     # 배포용 (선택 사항)
```

- `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY`는 필수입니다. SDK 로딩 실패 시 지도 기능이 동작하지 않습니다.
- `NEXT_PUBLIC_BASE_URL_*`이 비어 있으면 동일 출처(`/api/*`)를 기본값으로 사용합니다.

## 제공 데이터

- `data/places.json`에 장소 목록이 저장됩니다.
- Next.js API Route (`/api/places`, `/api/places/[id]`)가 해당 파일을 읽어 정규화한 뒤 JSON 형태로 응답합니다.
- 장소 데이터 스키마는 `src/types/place.ts`에서 확인할 수 있습니다.

## 품질 관리

- `pnpm lint` : ESLint 기반 정적 검사
- 권장 수동 테스트
  - 지도 로딩 및 마커 클릭
  - 상세 모달 진입 및 공유 가능한 라우트 확인 (`/places/{id}`)
  - 서버/클라이언트 에러 처리 메시지 확인

## 참고 사항

- 카카오 지도 지오코딩 정확도는 주소 데이터 품질에 따라 달라질 수 있습니다. 신규 데이터를 추가할 때는 주소 포맷을 검증하세요.
- 대용량 이미지가 다수 포함되어 있으므로 배포 환경에서 CDN 활용을 권장합니다.
- 인터셉팅 라우트(`app/@modal/places/[id]`)는 Next.js 버전에 따라 동작 방식이 달라질 수 있으니 업그레이드 시 확인이 필요합니다.
