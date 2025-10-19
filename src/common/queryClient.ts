import { ApiError } from "@/common/utils/fetchClient";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        // API 에러인 경우
        if (error instanceof ApiError) {
          // 5xx 서버 에러는 최대 2번 재시도
          if (error.status >= 500) {
            return failureCount < 2;
          }
          // 4xx 클라이언트 에러는 재시도하지 않음
          if (error.status >= 400) {
            return false;
          }
        }
        // 네트워크 에러는 최대 3번 재시도
        return failureCount < 3;
      },
      gcTime: 10 * 60 * 1000, // 10분
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error: unknown) => {
        // mutation은 일반적으로 재시도하지 않지만, 네트워크 에러는 1번 재시도
        if (error instanceof ApiError && error.status === 0) {
          return failureCount < 1;
        }
        return false;
      },
    },
  },
});
