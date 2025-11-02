type Primitive = string | number | boolean | null | undefined;

export class ApiError<T = unknown> extends Error {
  status: number;
  data: T | null;

  constructor(status: number, data: T | null, message?: string) {
    super(message ?? `API Error: ${status}`);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

export type ParseStrategy =
  | "json"
  | "text"
  | "blob"
  | "arrayBuffer"
  | "response";

export interface FetchClientOptions<P extends ParseStrategy = "json">
  extends RequestInit {
  baseUrl?: string;
  searchParams?: Record<string, Primitive>;
  skipDefaultHeaders?: boolean;
  parseAs?: P;
}

type ParseResult<T, P extends ParseStrategy> = P extends "json"
  ? T
  : P extends "text"
  ? string
  : P extends "blob"
  ? Blob
  : P extends "arrayBuffer"
  ? ArrayBuffer
  : Response;

const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === "[object Object]";

const buildUrl = (
  input: string | URL,
  baseUrl?: string,
  searchParams?: Record<string, Primitive>
): string => {
  const hasBaseUrl = Boolean(baseUrl);

  if (input instanceof URL) {
    const url = new URL(input);

    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        url.searchParams.set(key, String(value));
      });
    }

    return url.toString();
  }

  if (!hasBaseUrl || ABSOLUTE_URL_REGEX.test(input)) {
    return appendSearchParams(input, searchParams);
  }

  const normalizedBaseUrl = baseUrl!.endsWith("/")
    ? baseUrl!.slice(0, -1)
    : baseUrl!;
  const normalizedPath = input.startsWith("/") ? input : `/${input}`;

  return appendSearchParams(
    `${normalizedBaseUrl}${normalizedPath}`,
    searchParams
  );
};

const appendSearchParams = (
  rawUrl: string,
  searchParams?: Record<string, Primitive>
): string => {
  if (!searchParams || Object.keys(searchParams).length === 0) {
    return rawUrl;
  }

  const url = new URL(rawUrl, "http://localhost");

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    url.searchParams.set(key, String(value));
  });

  const base = rawUrl.startsWith("http") ? url.origin : "";
  const path = `${url.pathname}${url.search}${url.hash}`;

  return `${base}${path}`;
};

const prepareRequestInit = (
  requestInit: RequestInit,
  skipDefaultHeaders?: boolean
): RequestInit => {
  const headers = new Headers(requestInit.headers);
  let body: BodyInit | null | undefined = requestInit.body;

  if (!skipDefaultHeaders && !headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const hasReadableStream =
    typeof ReadableStream !== "undefined" && body instanceof ReadableStream;

  const isArrayBufferView =
    typeof ArrayBuffer !== "undefined" &&
    ArrayBuffer.isView(body as ArrayBufferView);

  if (
    body &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer) &&
    !isArrayBufferView &&
    !hasReadableStream
  ) {
    body = JSON.stringify(body);
    if (!skipDefaultHeaders && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  return {
    ...requestInit,
    headers,
    body: body ?? undefined,
  };
};

const parseSuccessResponse = async <T, P extends ParseStrategy>(
  response: Response,
  strategy: P
): Promise<ParseResult<T, P>> => {
  if (strategy === "response") {
    return response as ParseResult<T, P>;
  }

  if (strategy === "text") {
    return (await response.text()) as ParseResult<T, P>;
  }

  if (strategy === "blob") {
    return (await response.blob()) as ParseResult<T, P>;
  }

  if (strategy === "arrayBuffer") {
    return (await response.arrayBuffer()) as ParseResult<T, P>;
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as ParseResult<T, P>;
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength === "0") {
    return undefined as ParseResult<T, P>;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return undefined as ParseResult<T, P>;
  }

  try {
    return (await response.json()) as ParseResult<T, P>;
  } catch {
    return undefined as ParseResult<T, P>;
  }
};

const parseErrorResponse = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
};

export const fetchClient = async <
  T = unknown,
  P extends ParseStrategy = "json"
>(
  input: string | URL,
  options: FetchClientOptions<P> = {}
): Promise<ParseResult<T, P>> => {
  const { baseUrl, searchParams, skipDefaultHeaders, parseAs, ...requestInit } =
    options;

  const url = buildUrl(input, baseUrl, searchParams);
  const init = prepareRequestInit(requestInit, skipDefaultHeaders);
  const strategy = (parseAs ?? "json") as P;

  try {
    const response = await fetch(url, init);

    if (!response.ok) {
      const errorPayload = await parseErrorResponse(response.clone());
      const message =
        (isPlainObject(errorPayload) && typeof errorPayload.message === "string"
          ? errorPayload.message
          : undefined) ?? response.statusText;

      throw new ApiError(response.status, errorPayload, message);
    }

    return await parseSuccessResponse<T, P>(response, strategy);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new ApiError(0, null, error.message);
    }

    throw new ApiError(0, null, "Network error");
  }
};
