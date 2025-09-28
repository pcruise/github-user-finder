import { GET } from "./route";
import { NextResponse } from "next/server";
import { createGithubApiResponse } from "@/lib/apiUtils";
import { GITHUB_API_URL_BASE, GITHUB_REQUEST_HEADER } from "@/lib/constants";

// 'fetch' 함수를 모킹합니다.
global.fetch = jest.fn();

// NextResponse.json을 모킹하여 반환 값을 확인할 수 있도록 합니다.
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

// createGithubApiResponse 헬퍼 함수를 모킹하여 GET 핸들러의 로직만 고립시켜 테스트합니다.
jest.mock("@/lib/apiUtils", () => ({
  createGithubApiResponse: jest.fn(),
}));

// jest.Mock 타입으로 캐스팅하여 mockClear, mockResolvedValue 등을 사용합니다.
const mockFetch = fetch as jest.Mock;
const mockCreateGithubApiResponse = createGithubApiResponse as jest.Mock;
const mockNextResponseJson = NextResponse.json as jest.Mock;

describe("API Route: /api/find", () => {
  // 각 테스트가 끝나면 모킹된 함수들의 호출 기록을 초기화합니다.
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("성공적인 검색 요청 시, 올바른 데이터와 함께 200 상태 코드를 반환해야 합니다.", async () => {
    // --- 준비 (Arrange) ---
    const mockRequest = new Request("http://localhost/api/find?q=testuser");
    const mockGithubResponse = new Response(JSON.stringify({ items: [] }), {
      status: 200,
    });
    const mockApiResponse = {
      status: 200,
      items: [{ id: 1, login: "testuser" }],
    };

    mockFetch.mockResolvedValue(mockGithubResponse);
    mockCreateGithubApiResponse.mockResolvedValue(mockApiResponse);

    // --- 실행 (Act) ---
    await GET(mockRequest);

    // --- 검증 (Assert) ---
    // 1. fetch가 올바른 URL과 옵션으로 호출되었는지 확인
    expect(mockFetch).toHaveBeenCalledWith(
      `${GITHUB_API_URL_BASE}?q=testuser&per_page=100`,
      {
        method: "GET",
        headers: GITHUB_REQUEST_HEADER,
      }
    );

    // 2. createGithubApiResponse가 fetch의 응답으로 호출되었는지 확인
    expect(mockCreateGithubApiResponse).toHaveBeenCalledWith(
      mockGithubResponse
    );

    // 3. NextResponse.json이 성공 응답 데이터로 호출되었는지 확인
    expect(mockNextResponseJson).toHaveBeenCalledWith(mockApiResponse);
  });

  it("GitHub API 에러 발생 시, 에러 데이터와 해당 상태 코드를 반환해야 합니다.", async () => {
    // --- 준비 (Arrange) ---
    const mockRequest = new Request("http://localhost/api/find?q=testuser");
    const mockGithubErrorResponse = new Response(
      JSON.stringify({ message: "API rate limit exceeded" }),
      { status: 403 }
    );
    const mockApiErrorResponse = {
      status: 403,
      message: "API rate limit exceeded",
    };

    mockFetch.mockResolvedValue(mockGithubErrorResponse);
    mockCreateGithubApiResponse.mockResolvedValue(mockApiErrorResponse);

    // --- 실행 (Act) ---
    await GET(mockRequest);

    // --- 검증 (Assert) ---
    // 1. fetch가 호출되었는지 확인
    expect(mockFetch).toHaveBeenCalled();

    // 2. createGithubApiResponse가 호출되었는지 확인
    expect(mockCreateGithubApiResponse).toHaveBeenCalledWith(
      mockGithubErrorResponse
    );

    // 3. NextResponse.json이 에러 응답 데이터와 상태 코드로 호출되었는지 확인
    expect(mockNextResponseJson).toHaveBeenCalledWith(mockApiErrorResponse, {
      status: mockApiErrorResponse.status,
    });
  });

  it("쿼리 파라미터가 없는 요청도 처리해야 합니다.", async () => {
    // --- 준비 (Arrange) ---
    const mockRequest = new Request("http://localhost/api/find");
    const mockGithubResponse = new Response(JSON.stringify({}), {
      status: 200,
    });
    const mockApiResponse = { status: 200, items: [] };

    mockFetch.mockResolvedValue(mockGithubResponse);
    mockCreateGithubApiResponse.mockResolvedValue(mockApiResponse);

    // --- 실행 (Act) ---
    await GET(mockRequest);

    // --- 검증 (Assert) ---
    // 1. fetch가 per_page만 포함된 URL로 호출되었는지 확인
    expect(mockFetch).toHaveBeenCalledWith(
      `${GITHUB_API_URL_BASE}?per_page=100`,
      {
        method: "GET",
        headers: GITHUB_REQUEST_HEADER,
      }
    );
    expect(mockNextResponseJson).toHaveBeenCalledWith(mockApiResponse);
  });
});
