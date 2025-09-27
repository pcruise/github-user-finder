import { createGithubApiResponse } from "@/lib/apiUtils";
import { NextResponse } from "next/server";

const REQUEST_HEADER = {
  "Content-Type": "application/vnd.github+json",
  Authorization: process.env.GITHUB_TOKEN
    ? `token ${process.env.GITHUB_TOKEN}`
    : "",
} as const;

const GITHUB_API_URL_BASE = "https://api.github.com/search/users" as const;

export async function GET(request: Request) {
  const url = new URL(request.url);
  // 한번에 가져올 수 있는 페이지 당 최대 갯수로 설정합니다
  url.searchParams.append("per_page", "100");

  const response = await fetch(`${GITHUB_API_URL_BASE}${url.search}`, {
    method: "GET",
    headers: REQUEST_HEADER,
  });

  const responseObject = await createGithubApiResponse(response);

  if (responseObject.status === 200) {
    return NextResponse.json(responseObject);
  }

  return NextResponse.json(responseObject, { status: responseObject.status });
}
