export type KakaoLatLng = {
  getLat: () => number;
  getLng: () => number;
};

export type KakaoLatLngBounds = {
  extend: (latLng: KakaoLatLng) => void;
};

export type KakaoMap = {
  setCenter: (latLng: KakaoLatLng) => void;
  setLevel: (level: number) => void;
  setBounds: (bounds: KakaoLatLngBounds) => void;
  panTo: (latLng: KakaoLatLng) => void;
  panBy: (x: number, y: number) => void;
  getCenter: () => KakaoLatLng;
  getProjection: () => KakaoProjection;
};

export type KakaoMarker = {
  setMap: (map: KakaoMap | null) => void;
  getPosition: () => KakaoLatLng | undefined;
};

export type KakaoCustomOverlayOptions = {
  position: KakaoLatLng;
  content: HTMLElement | string;
  map?: KakaoMap;
  xAnchor?: number;
  yAnchor?: number;
  zIndex?: number;
  clickable?: boolean;
};

export type KakaoCustomOverlay = {
  setMap: (map: KakaoMap | null) => void;
  getMap: () => KakaoMap | null;
  setContent: (content: HTMLElement | string) => void;
  setPosition: (position: KakaoLatLng) => void;
};

export type KakaoPoint = {
  x: number;
  y: number;
};

export type KakaoProjection = {
  containerPointFromCoords: (coords: KakaoLatLng) => KakaoPoint;
  coordsFromContainerPoint: (point: KakaoPoint) => KakaoLatLng;
};

export type KakaoMapOptions = {
  center: KakaoLatLng;
  level?: number;
};

export type KakaoMarkerOptions = {
  position: KakaoLatLng;
  map?: KakaoMap;
  title?: string;
};

export type KakaoGeocoderStatus = {
  OK: string;
  ZERO_RESULT: string;
  ERROR: string;
};

export type KakaoGeocoderResult = {
  address_name: string;
  x: string;
  y: string;
};

export type KakaoAddressSearchCallback = (
  results: KakaoGeocoderResult[],
  status: string
) => void;

export type KakaoGeocoder = {
  addressSearch: (query: string, callback: KakaoAddressSearchCallback) => void;
};

export type KakaoServicesNamespace = {
  Geocoder: new () => KakaoGeocoder;
  Status: KakaoGeocoderStatus;
};

export type KakaoMapsEventNamespace = {
  addListener: (
    target: KakaoMarker | KakaoMap,
    eventName: string,
    handler: (...args: unknown[]) => void
  ) => void;
  preventMap: (element: HTMLElement) => void;
};

export type KakaoMapsNamespace = {
  load: (callback: () => void) => void;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  LatLngBounds: new () => KakaoLatLngBounds;
  Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap;
  Marker: new (options: KakaoMarkerOptions) => KakaoMarker;
  CustomOverlay: new (options: KakaoCustomOverlayOptions) => KakaoCustomOverlay;
  Point: new (x: number, y: number) => KakaoPoint;
  event: KakaoMapsEventNamespace;
  services: KakaoServicesNamespace;
};

export type KakaoNamespace = {
  maps?: KakaoMapsNamespace;
};

export type KakaoWindow = Window & {
  kakao?: KakaoNamespace;
};
