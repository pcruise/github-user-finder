"use client";

import { useFindInfiniteQuery } from "@/services/githubUserFindApi";
import { RootState } from "@/store";
import {
  Alert,
  AlertTitle,
  Button,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";
import { ReactNode } from "react";
import { InView } from "react-intersection-observer";
import { useSelector } from "react-redux";
import { UserCard } from "./UserCard";
import ReplayIcon from "@mui/icons-material/Replay";

const IN_LOADING_USER_CARDS_NUM = 4 as const;

const useDataSet = () => {
  const { searchString } = useSelector((s: RootState) => s.finder);
  const {
    currentData,
    error,
    isError,
    isFetching,
    fetchNextPage,
    hasNextPage,
    fetchPreviousPage,
  } = useFindInfiniteQuery(searchString, { skip: !searchString });

  return {
    currentData,
    error,
    isError,
    isFetching,
    isEOL: !hasNextPage && currentData,
    hasSearchString: !!searchString,
    fetchNextPage,
    fetchPreviousPage,
  };
};

export function AppList(): ReactNode {
  const {
    currentData,
    fetchNextPage,
    fetchPreviousPage,
    isError,
    error,
    isFetching,
    isEOL,
    hasSearchString,
  } = useDataSet();

  return (
    <>
      {currentData?.pages.map((page) =>
        page.items.map((user) => <UserCard user={user} key={user.id} />)
      )}
      {isFetching &&
        Array.from({ length: IN_LOADING_USER_CARDS_NUM }).map((_, idx) => (
          <UserCard key={idx} />
        ))}
      {isEOL && (
        <Divider
          className="col-span-full font-semibold text-sm"
          variant="middle"
        >
          END OF LIST
        </Divider>
      )}
      {isError && error && (
        <Alert
          severity="error"
          className="col-span-full mb-4"
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
                  label={`RateLimit ${error.data.rate_limit_remaining}/${error.data.rate_limit}`}
                  size="small"
                  variant="outlined"
                  color="error"
                />
              </div>
            </div>
          }
        >
          <AlertTitle fontWeight="bold">Error ({error.status})</AlertTitle>
          {error.data.message}
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
