/**
 * @jest-environment jsdom
 */

/**
 * @file githubUserFindApi RTK Query 훅의 테스트 파일입니다.
 * `useFindInfiniteQuery` 훅의 동작을 중심으로 테스트하며,
 * 실제 네트워크 요청 대신 `fetch`를 모킹하여 사용합니다.
 */

import { configureStore } from "@reduxjs/toolkit";
import { renderHook, waitFor } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { githubUserFindApi, useFindInfiniteQuery } from "./githubUserFindApi";
import "whatwg-fetch";
import { APP_API_BASE_URL, APP_API_FIND_PATH } from "@/lib/constants";
import { GithubUserSearchResponse } from "@/types/api";

/**
 * `fetch` 함수를 모킹하여 실제 네트워크 요청이 발생하지 않도록 합니다.
 * 각 테스트 케이스에서 이 모의 함수를 사용하여 API 응답을 시뮬레이션합니다.
 */
const mockFetch = jest.fn();
global.fetch = mockFetch;

/**
 * RTK Query 훅을 테스트하기 위한 Redux 스토어와 Provider를 포함하는 래퍼 컴포넌트를 생성합니다.
 * `renderHook`의 `wrapper` 옵션으로 사용됩니다.
 * @returns 훅 테스트를 위한 래퍼 컴포넌트입니다.
 */
const createWrapper = () => {
  // 테스트용 Redux 스토어를 설정합니다.
  // githubUserFindApi의 리듀서와 미들웨어를 포함합니다.
  const store = configureStore({
    reducer: {
      [githubUserFindApi.reducerPath]: githubUserFindApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(githubUserFindApi.middleware),
  });

  /**
   * 자식 컴포넌트를 Redux Provider로 감싸는 래퍼 컴포넌트입니다.
   * @param {PropsWithChildren} props - React 컴포넌트 props입니다.
   * @returns {JSX.Element} Provider로 감싸진 자식 컴포넌트입니다.
   */
  const wrapper = ({ children }: PropsWithChildren) => {
    return <Provider store={store}>{children}</Provider>;
  };
  return wrapper;
};

/**
 * 테스트에서 예상되는 API 요청 URL을 생성하는 헬퍼 함수입니다.
 * @param {[string, string][]} params - URL에 추가할 쿼리 파라미터 배열입니다.
 * @returns {string} 생성된 요청 URL의 경로와 쿼리 문자열입니다.
 */
const makeTestFindRequestUrl = (params: [string, string][]) => {
  const expectUrl = new URL(
    APP_API_BASE_URL + APP_API_FIND_PATH,
    "http://example.com"
  );
  params.forEach((param) => {
    expectUrl.searchParams.append(param[0], param[1]);
  });

  return expectUrl.pathname + expectUrl.search;
};

/**
 * 테스트용 GithubUserSearchResponse 객체를 생성하는 헬퍼 함수입니다.
 * 기본값을 가지며, 주어진 데이터로 일부 속성을 덮어쓸 수 있습니다.
 * @param {Partial<GithubUserSearchResponse>} data - 응답 객체에 덮어쓸 데이터입니다.
 * @returns {GithubUserSearchResponse} 완전한 형태의 테스트 응답 객체입니다.
 */
const makeTestFindResponse = (
  data: Partial<GithubUserSearchResponse>
): GithubUserSearchResponse => {
  return {
    total_count: 0,
    incomplete_results: false,
    items: [],
    status: 200,
    rate_limit: "",
    rate_limit_remaining: "",
    ...data,
  };
};

/**
 * `githubUserFindApi` 테스트 스위트입니다.
 */
describe("githubUserFindApi", () => {
  beforeEach(() => {
    // 각 테스트가 독립적으로 실행되도록 mockFetch의 호출 기록을 초기화합니다.
    mockFetch.mockClear();
  });

  /**
   * `useFindInfiniteQuery` 훅이 초기 쿼리를 수행하고 성공적으로 데이터를 반환하는지 테스트합니다.
   */
  it("should handle initial query and return data", async () => {
    // API 성공 응답을 모킹합니다.
    const mockResponse: GithubUserSearchResponse = makeTestFindResponse({
      total_count: 150,
    });
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    // 훅을 렌더링합니다.
    const { result } = renderHook(
      () => useFindInfiniteQuery(["test", "type:user", "followers"]),
      { wrapper: createWrapper() }
    );

    // 초기 상태는 isFetching=true 여야 합니다.
    expect(result.current.isFetching).toBe(true);

    // 데이터 로딩이 완료될 때까지 기다립니다.
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // fetch가 올바른 URL로 호출되었는지 확인합니다.
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: makeTestFindRequestUrl([
          ["q", "test type:user"],
          ["sort", "followers"],
          ["page", "1"],
        ]),
      })
    );

    // 반환된 데이터가 예상과 일치하는지 확인합니다.
    expect(result.current.data?.pages[0]).toEqual(mockResponse);
    expect(result.current.data?.pages[0].total_count).toBe(
      mockResponse.total_count
    );
    expect(result.current.hasNextPage).toBe(true);
  });

  /**
   * `fetchNextPage` 함수를 호출했을 때 다음 페이지의 데이터를 올바르게 가져오는지 테스트합니다.
   */
  it("should fetch the next page when fetchNextPage is called", async () => {
    // 첫 번째와 두 번째 페이지에 대한 API 응답을 각각 모킹합니다.
    const firstPageResponse: GithubUserSearchResponse = makeTestFindResponse({
      total_count: 200,
    });

    const secondPageResponse: GithubUserSearchResponse = makeTestFindResponse({
      total_count: 200,
    });

    mockFetch
      .mockResolvedValueOnce(
        new Response(JSON.stringify(firstPageResponse), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(secondPageResponse), { status: 200 })
      );

    // 훅을 렌더링합니다.
    const { result } = renderHook(
      () => useFindInfiniteQuery(["nextpage", "", ""]),
      { wrapper: createWrapper() }
    );

    // 첫 페이지 로딩 완료
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages).toHaveLength(1);
    expect(result.current.hasNextPage).toBe(true);

    // 다음 페이지를 요청합니다.
    result.current.fetchNextPage();

    // 두 번째 페이지 로딩 완료
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));

    // fetch가 두 번 호출되었는지, 두 번째 호출이 올바른 page 파라미터를 가졌는지 확인합니다.
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: makeTestFindRequestUrl([
          ["q", "nextpage"],
          ["sort", ""],
          ["page", "1"],
        ]),
      })
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: makeTestFindRequestUrl([
          ["q", "nextpage"],
          ["sort", ""],
          ["page", "2"],
        ]),
      })
    );
    expect(result.current.hasNextPage).toBe(false);
  });

  /**
   * API 응답을 기반으로 더 이상 다음 페이지가 없을 때 `hasNextPage`가 `false`로 설정되는지 테스트합니다.
   */
  it("should set hasNextPage to false when on the last page", async () => {
    // total_count가 100 이하이므로 첫 페이지가 마지막 페이지입니다.
    // (페이지당 아이템 수는 100개로 가정)
    const mockResponse = { items: [], total_count: 50 };
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    const { result } = renderHook(
      () => useFindInfiniteQuery(["lastpage", "", ""]),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // 1 * 100 >= 50 이므로 hasNextPage는 false여야 합니다.
    expect(result.current.hasNextPage).toBe(false);
  });

  /**
   * API가 에러를 반환했을 때 훅이 에러 상태를 올바르게 처리하는지 테스트합니다.
   */
  it("should handle API errors", async () => {
    // 403 Forbidden 에러 응답을 모킹합니다.
    const errorResponse = { message: "API rate limit exceeded" };
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(errorResponse), {
        status: 403,
        statusText: "Forbidden",
      })
    );

    // 훅을 렌더링합니다.
    const { result } = renderHook(
      () => useFindInfiniteQuery(["error", "", ""]),
      {
        wrapper: createWrapper(),
      }
    );

    // 훅의 상태가 에러로 변경될 때까지 기다립니다.
    await waitFor(() => expect(result.current.isError).toBe(true));

    // 에러 상태와 에러 내용이 올바르게 설정되었는지 확인합니다.
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBeDefined();
    // RTK Query는 에러 응답을 파싱하여 data 프로퍼티에 넣습니다.
    expect((result.current.error as any).data).toEqual(errorResponse);
    expect((result.current.error as any).status).toBe(403);
  });
});
