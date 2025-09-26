import { GithubUser } from "./user";

export interface GithubUserSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GithubUser[];
  status: number;
  rate_limit: string;
  rate_limit_remaining: string;
}

export interface FindApiResponse {}

export interface GithubUserSearchError {
  status: number;
  message: string;
  rate_limit: string;
  rate_limit_remaining: string;
}
