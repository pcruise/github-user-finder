/**
 * @jest-environment jsdom
 */
import { setSortOption } from "@/services/finderSlice";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useDispatch } from "react-redux";
import { UserListHeader } from "./UserListHeader";

// 의존성 모킹
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
}));

// 모킹된 훅을 타입과 함께 가져옵니다.
const mockUseDispatch = useDispatch as unknown as jest.Mock;

describe("UserListHeader", () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    // 각 테스트 전에 모킹된 함수들을 초기화합니다.
    mockUseDispatch.mockReturnValue(mockDispatch);
    jest.useFakeTimers(); // 디바운스 테스트를 위해 가짜 타이머를 사용합니다.
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers(); // 테스트 후 실제 타이머로 복원합니다.
  });

  it("should render correctly with user count", () => {
    render(<UserListHeader isEmpty={false} isFetching={false} count={123} />);

    // 정렬 드롭다운이 렌더링되는지 확인
    expect(screen.getByLabelText("Sort by")).toBeInTheDocument();
    // 사용자 수가 올바르게 표시되는지 확인
    expect(screen.getByText("Found 123 users")).toBeInTheDocument();
    // 구분선이 렌더링되는지 확인
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("should display 'user' for a single result and 'users' for multiple results", () => {
    // 1명일 때
    const { rerender } = render(
      <UserListHeader isEmpty={false} isFetching={false} count={1} />
    );
    expect(screen.getByText("Found 1 user")).toBeInTheDocument();

    // 2명일 때
    rerender(<UserListHeader isEmpty={false} isFetching={false} count={2} />);
    expect(screen.getByText("Found 2 users")).toBeInTheDocument();
  });

  it("should show a skeleton when fetching and count is zero", () => {
    render(<UserListHeader isEmpty={true} isFetching={true} count={0} />);

    // 로딩 스켈레톤이 표시되는지 확인
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    // 사용자 수 텍스트는 표시되지 않아야 함
    expect(screen.queryByText(/Found/)).not.toBeInTheDocument();
  });

  it("should not show user count when the list is empty", () => {
    render(<UserListHeader isEmpty={true} isFetching={false} count={0} />);

    // 사용자 수 텍스트가 표시되지 않는지 확인
    expect(screen.queryByText(/Found/)).not.toBeInTheDocument();
  });

  it("should not dispatch sort option on initial render", () => {
    render(<UserListHeader isEmpty={false} isFetching={false} count={10} />);

    // 디바운스 시간을 포함하여 타이머를 진행
    act(() => {
      jest.advanceTimersByTime(150);
    });

    // 초기 렌더링 시에는 dispatch가 호출되지 않아야 함
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("should debounce sort option change and dispatch action", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<UserListHeader isEmpty={false} isFetching={false} count={10} />);

    // 드롭다운 트리거를 클릭하여 옵션을 엽니다.
    const selectTrigger = screen.getByRole("combobox", { name: "Sort by" });
    await user.click(selectTrigger);
    // 'Followers' 옵션을 선택
    await user.click(screen.getByRole("option", { name: "Followers" }));

    // 디바운스 시간(150ms)이 지나기 전에는 dispatch가 호출되지 않음
    expect(mockDispatch).not.toHaveBeenCalled();

    // 타이머를 150ms 진행
    act(() => {
      jest.advanceTimersByTime(150);
    });

    // 150ms 후 dispatch가 올바른 액션과 함께 호출되었는지 확인
    expect(mockDispatch).toHaveBeenCalledWith(setSortOption("followers"));
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
});
