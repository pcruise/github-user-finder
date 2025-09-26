import { GithubUserSearchResponse } from "@/types/api";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const githubUserFindApi = createApi({
  reducerPath: "githubUserFindApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
  }),
  endpoints: (builder) => ({
    find: builder.infiniteQuery<GithubUserSearchResponse, string, number>({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: function (
          lastPage: GithubUserSearchResponse,
          allPages: GithubUserSearchResponse[],
          lastPageParam: number,
          allPageParams: number[],
          queryArg: string
        ): number | null | undefined {
          if (lastPageParam * 100 >= lastPage.total_count) return null;
          return lastPageParam + 1;
        },
      },
      query: ({ queryArg, pageParam }) => {
        return {
          url: "/find",
          params: { q: queryArg, page: pageParam, per_page: 100 },
        };
      },
      keepUnusedDataFor: 60,
    }),
  }),
});

export const { useFindInfiniteQuery } = githubUserFindApi;
