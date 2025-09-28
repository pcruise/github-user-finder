"use client";

import { parseGithubUserSearchError } from "@/lib/apiUtils";
import { useFindInfiniteQuery } from "@/services/githubUserFindApi";
import { RootState } from "@/store";
import ReplayIcon from "@mui/icons-material/Replay";
import { Alert, AlertTitle, Button, Chip, Divider } from "@mui/material";
import { ReactNode } from "react";
import { InView } from "react-intersection-observer";
import { useSelector } from "react-redux";
import { UserCard } from "./UserCard";
import { UserListHeader } from "./UserListHeader";

const IN_LOADING_USER_CARDS_NUM = 4 as const;

/**
 * Redux 스토어의 검색어, 필터, 정렬 옵션을 사용하여
 * Github 사용자 검색 API(`useFindInfiniteQuery`)를 호출하고,
 * 컴포넌트에서 사용하기 쉬운 형태로 데이터를 가공하여 반환하는 커스텀 훅입니다.
 * @returns 사용자 목록 데이터 및 API 상태
 */
const useDataSet = () => {
  const { searchString, filter, sort } = useSelector(
    (s: RootState) => s.finder
  );
  const {
    currentData,
    error,
    isError,
    isFetching,
    fetchNextPage,
    hasNextPage,
    fetchPreviousPage,
  } = useFindInfiniteQuery([searchString, filter, sort], {
    skip: !searchString,
  });

  const count = currentData?.pages?.[0].total_count ?? 0;

  return {
    currentData,
    count,
    error: parseGithubUserSearchError(error),
    isEmpty: !currentData,
    isError,
    isFetching,
    isEOL: !hasNextPage && currentData,
    hasSearchString: !!searchString,
    fetchNextPage,
    fetchPreviousPage,
  };
};

/**
 * 검색된 GitHub 사용자 목록을 표시하는 컴포넌트입니다.
 * 무한 스크롤, 로딩 스켈레톤, 에러 상태 처리를 담당합니다.
 * @returns {ReactNode} UserList 컴포넌트
 */
export function UserList(): ReactNode {
  const {
    currentData,
    count,
    fetchNextPage, // 다음 페이지 로드 함수
    fetchPreviousPage, // 데이터 재요청 함수
    isError,
    isEmpty,
    error,
    isFetching,
    isEOL,
    hasSearchString,
  } = useDataSet();

  return (
    <>
      <UserListHeader isEmpty={isEmpty} isFetching={isFetching} count={count} />
      <ul className="grid gap-4 grid-cols-1 my-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {currentData?.pages.map((page) =>
          page.items.map((user) => <UserCard user={user} key={user.id} />)
        )}
        {isFetching &&
          Array.from({ length: IN_LOADING_USER_CARDS_NUM }).map((_, idx) => (
            <UserCard key={idx} />
          ))}
      </ul>
      {isEOL && count > 0 && (
        <Divider className="font-semibold text-sm" variant="middle">
          END OF LIST
        </Divider>
      )}
      {isError && error && (
        <Alert
          severity="error"
          className="mb-4"
          action={
            <div className="flex flex-col gap-4 h-full justify-between p-1">
              <Button
                variant="outlined"
                endIcon={<ReplayIcon />}
                color="error"
                onClick={() => {
                  fetchPreviousPage();
                }}
              >
                Retry
              </Button>
              <div className="flex flex-col">
                <Chip
                  label={`RateLimit ${error.rate_limit_remaining}/${error.rate_limit}`}
                  size="small"
                  variant="outlined"
                  color="error"
                />
              </div>
            </div>
          }
        >
          <AlertTitle fontWeight="bold">Error ({error.status})</AlertTitle>
          {error.message}
        </Alert>
      )}
      {!isEOL && !isError && (
        <InView
          className="h-10"
          onChange={(inView) => {
            if (hasSearchString && inView) {
              fetchNextPage();
            }
          }}
        ></InView>
      )}
    </>
  );
}
