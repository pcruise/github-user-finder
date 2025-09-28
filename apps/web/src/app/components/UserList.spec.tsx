/**
 * @jest-environment jsdom
 */
import { parseGithubUserSearchError } from "@/lib/apiUtils";
import { useFindInfiniteQuery } from "@/services/githubUserFindApi";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useSelector } from "react-redux";
import { UserList } from "./UserList";

// --- 의존성 모킹 ---

// Redux의 useSelector 훅 모킹
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
}));

// RTK Query의 useFindInfiniteQuery 훅 모킹
jest.mock("@/services/githubUserFindApi", () => ({
  useFindInfiniteQuery: jest.fn(),
}));

// react-intersection-observer의 InView 컴포넌트 모킹
let mockInViewOnChange: (inView: boolean) => void;
jest.mock("react-intersection-observer", () => ({
  InView: ({ onChange }: { onChange: (inView: boolean) => void }) => {
    mockInViewOnChange = onChange; // 테스트에서 onChange를 트리거할 수 있도록 함수를 외부로 노출
    return <div data-testid="mock-in-view" />;
  },
}));

// 자식 컴포넌트 모킹 (UserList의 로직에 집중)
jest.mock("./UserCard", () => ({
  UserCard: ({ user }: { user?: { id: number; login: string } }) => (
    <li data-testid={user ? "user-card" : "user-card-skeleton"}>
      {user ? user.login : "Loading..."}
    </li>
  ),
}));
jest.mock("./UserListHeader", () => ({
  UserListHeader: ({ count }: { count: number }) => (
    <div data-testid="user-list-header">Found {count} users</div>
  ),
}));

// 유틸리티 함수 모킹
jest.mock("@/lib/apiUtils", () => ({
  parseGithubUserSearchError: jest.fn((error) => error), // 간단하게 받은 에러를 그대로 반환
}));

// 모킹된 훅/함수 타입 캐스팅
const mockUseSelector = useSelector as unknown as jest.Mock;
const mockUseFindInfiniteQuery = useFindInfiniteQuery as jest.Mock;
const mockParseGithubUserSearchError = parseGithubUserSearchError as jest.Mock;

describe("UserList", () => {
  // 각 테스트 전에 모킹된 함수들 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should skip the query and render nothing when there is no search string", () => {
    // useSelector가 빈 검색어를 반환하도록 설정
    mockUseSelector.mockReturnValue({ searchString: "", filter: "", sort: "" });
    // useFindInfiniteQuery의 기본 반환값 설정
    mockUseFindInfiniteQuery.mockReturnValue({});

    render(<UserList />);

    // useFindInfiniteQuery가 skip: true 옵션으로 호출되었는지 확인
    expect(mockUseFindInfiniteQuery).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ skip: true })
    );
    // 사용자 카드나 스켈레톤이 없는지 확인
    expect(screen.queryByTestId("user-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("user-card-skeleton")).not.toBeInTheDocument();
  });

  it("should display loading skeletons while fetching data", () => {
    mockUseSelector.mockReturnValue({
      searchString: "test",
      filter: "",
      sort: "",
    });
    mockUseFindInfiniteQuery.mockReturnValue({
      isFetching: true,
      currentData: undefined, // 아직 데이터 없음
    });

    render(<UserList />);

    // 4개의 스켈레톤이 렌더링되는지 확인 (IN_LOADING_USER_CARDS_NUM)
    const skeletons = screen.getAllByTestId("user-card-skeleton");
    expect(skeletons).toHaveLength(4);
    expect(skeletons[0]).toHaveTextContent("Loading...");
  });

  it("should render the user list on successful data fetch", () => {
    const mockData = {
      pages: [
        {
          items: [
            { id: 1, login: "user1" },
            { id: 2, login: "user2" },
          ],
          total_count: 2,
        },
      ],
    };
    mockUseSelector.mockReturnValue({
      searchString: "test",
      filter: "",
      sort: "",
    });
    mockUseFindInfiniteQuery.mockReturnValue({
      currentData: mockData,
      isFetching: false,
    });

    render(<UserList />);

    // 헤더에 올바른 카운트가 표시되는지 확인
    expect(screen.getByTestId("user-list-header")).toHaveTextContent(
      "Found 2 users"
    );
    // 사용자 카드가 렌더링되는지 확인
    expect(screen.getByText("user1")).toBeInTheDocument();
    expect(screen.getByText("user2")).toBeInTheDocument();
    // 로딩 스켈레톤은 없어야 함
    expect(screen.queryByTestId("user-card-skeleton")).not.toBeInTheDocument();
  });

  it("should display an error message and a retry button on error", () => {
    const mockError = {
      status: 403,
      message: "API rate limit exceeded",
      rate_limit: 60,
      rate_limit_remaining: 0,
    };
    const mockFetchPreviousPage = jest.fn();
    mockUseSelector.mockReturnValue({
      searchString: "test",
      filter: "",
      sort: "",
    });
    mockUseFindInfiniteQuery.mockReturnValue({
      isError: true,
      error: mockError,
      fetchPreviousPage: mockFetchPreviousPage,
    });
    mockParseGithubUserSearchError.mockReturnValue(mockError);

    render(<UserList />);

    // 에러 Alert가 표시되는지 확인
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Error \(403\)/)).toBeInTheDocument();
    expect(screen.getByText("API rate limit exceeded")).toBeInTheDocument();
    expect(screen.getByText(/RateLimit 0\/60/)).toBeInTheDocument();

    // 재시도 버튼 클릭 시 fetchPreviousPage가 호출되는지 확인
    const retryButton = screen.getByRole("button", { name: /Retry/i });
    fireEvent.click(retryButton);
    expect(mockFetchPreviousPage).toHaveBeenCalledTimes(1);
  });

  it("should display 'END OF LIST' message on the last page", () => {
    mockUseSelector.mockReturnValue({
      searchString: "test",
      filter: "",
      sort: "",
    });
    mockUseFindInfiniteQuery.mockReturnValue({
      currentData: { pages: [{ items: [], total_count: 1 }] }, // 데이터가 있어야 함
      hasNextPage: false, // 마지막 페이지
      isFetching: false,
    });

    render(<UserList />);

    expect(screen.getByText("END OF LIST")).toBeInTheDocument();
  });

  it("should fetch the next page when scrolled to the bottom", async () => {
    const mockFetchNextPage = jest.fn();
    mockUseSelector.mockReturnValue({
      searchString: "test",
      filter: "",
      sort: "",
    });
    mockUseFindInfiniteQuery.mockReturnValue({
      currentData: { pages: [{ items: [], total_count: 10 }] },
      hasNextPage: true,
      isFetching: false,
      fetchNextPage: mockFetchNextPage,
    });

    render(<UserList />);

    // InView 컴포넌트가 아직 보이지 않음
    expect(mockFetchNextPage).not.toHaveBeenCalled();

    // InView 컴포넌트가 뷰포트에 들어왔다고 시뮬레이션
    mockInViewOnChange(true);

    // fetchNextPage가 호출되었는지 확인
    await waitFor(() => {
      expect(mockFetchNextPage).toHaveBeenCalledTimes(1);
    });

    // InView가 뷰포트를 벗어났을 때는 호출되지 않음
    mockInViewOnChange(false);
    await waitFor(() => {
      expect(mockFetchNextPage).toHaveBeenCalledTimes(1); // 여전히 1번
    });
  });
});
