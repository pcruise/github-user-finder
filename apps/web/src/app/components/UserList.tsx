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

export function UserList(): ReactNode {
  const {
    currentData,
    count,
    fetchNextPage,
    fetchPreviousPage,
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
