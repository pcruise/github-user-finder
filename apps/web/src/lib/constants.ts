/**
 * GitHub API 요청에 사용될 헤더입니다.
 * 인증 토큰을 사용하여 API 요청 제한을 늘립니다.
 */
export const GITHUB_REQUEST_HEADER = {
  "Content-Type": "application/vnd.github+json",
  Authorization: process.env.GITHUB_TOKEN
    ? `token ${process.env.GITHUB_TOKEN}`
    : "",
} as const;

/**
 * GitHub 사용자 검색 API의 기본 URL입니다.
 */
export const GITHUB_API_URL_BASE =
  "https://api.github.com/search/users" as const;
