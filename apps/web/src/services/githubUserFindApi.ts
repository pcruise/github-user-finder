import { APP_API_BASE_URL, APP_API_FIND_PATH } from "@/lib/constants";
import { GithubUserSearchResponse } from "@/types/api";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: APP_API_BASE_URL,
});

export const githubUserFindApi = createApi({
  reducerPath: "githubUserFindApi",
  baseQuery,
  endpoints: (builder) => ({
    find: builder.infiniteQuery<
      GithubUserSearchResponse,
      [string, string, string], // searchString, filter, sort
      number
    >({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: function (
          lastPage: GithubUserSearchResponse,
          _allPages: GithubUserSearchResponse[],
          lastPageParam: number,
          _allPageParams: number[],
          _queryArg: [string, string, string]
        ): number | null | undefined {
          if (lastPageParam * 100 >= lastPage.total_count) return null;
          return lastPageParam + 1;
        },
      },
      query: ({ queryArg, pageParam }) => {
        return {
          url: APP_API_FIND_PATH,
          params: {
            q: `${queryArg[0]}${queryArg[1] ? ` ${queryArg[1]}` : ""}`,
            sort: queryArg[2],
            page: pageParam,
          },
        };
      },
      keepUnusedDataFor: 60,
    }),
  }),
});

export const { useFindInfiniteQuery } = githubUserFindApi;
