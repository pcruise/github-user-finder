import { createGithubApiResponse } from "@/lib/apiUtils";
import { GITHUB_API_URL_BASE, GITHUB_REQUEST_HEADER } from "@/lib/constants";
import { NextResponse } from "next/server";

/**
 * 클라이언트로부터 받은 쿼리를 사용하여 GitHub에서 사용자를 검색하는 API 라우트 핸들러입니다.
 * @param request - 들어오는 클라이언트 요청 객체입니다. 'q' 쿼리 파라미터로 검색어를 포함해야 합니다.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  // API 응답에서 페이지 당 최대 결과 개수인 100으로 설정합니다.
  url.searchParams.append("per_page", "100");

  const response = await fetch(`${GITHUB_API_URL_BASE}${url.search}`, {
    method: "GET",
    headers: GITHUB_REQUEST_HEADER,
  });

  const responseObject = await createGithubApiResponse(response);

  if (responseObject.status === 200) {
    return NextResponse.json(responseObject);
  }

  return NextResponse.json(responseObject, { status: responseObject.status });
}
