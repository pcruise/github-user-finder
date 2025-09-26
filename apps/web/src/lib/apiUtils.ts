import { GithubUserSearchError, GithubUserSearchResponse } from "@/types/api";

/**
 * GitHub API 응답(Response) 객체를 애플리케이션의 API 응답 형식으로 변환합니다.
 * 성공 시 `GithubUserSearchResponse`를, 오류 발생 시 `GithubUserSearchError`를 반환합니다.
 * 응답 헤더에서 GitHub API의 rate limit 정보도 함께 추출하여 포함합니다.
 * @param {Response} response - `fetch`를 통해 받은 GitHub API의 `Response` 객체.
 * @returns {Promise<GithubUserSearchResponse | GithubUserSearchError>} 성공 또는 실패 정보를 담은 API 응답 객체.
 */
export const createGithubApiResponse = async (response: Response) => {
  // rate limit 확인
  const rateLimit = {
    rate_limit: response.headers.get("x-ratelimit-limit") ?? "-",
    rate_limit_remaining: response.headers.get("x-ratelimit-remaining") ?? "-",
  };

  try {
    const res = await response.json();

    // Github 오류 발생 시
    if (!res?.items && res.status !== "200" && res.message) {
      const { message, status } = res;
      const responseJson: GithubUserSearchError = {
        status,
        message,
        ...rateLimit,
      };
      return responseJson;
    }

    // 정상 응답 시
    if (res && res.items) {
      const responseJson: GithubUserSearchResponse = {
        ...res,
        ...rateLimit,
        status: 200,
      };
      return responseJson;
    }
  } catch (e) {}

  // 기타 오류 발생 시
  const responseJson: GithubUserSearchError = {
    status: 500,
    message: "An unexpected server error occurred.",
    ...rateLimit,
  };

  return responseJson;
};
