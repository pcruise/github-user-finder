/**
 * @jest-environment jsdom
 */
import { useDrawer } from "@/providers/DrawerProvider";
import { setSearchString } from "@/services/finderSlice";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useDispatch } from "react-redux";
import { AppHeader } from "./AppHeader";

// 의존성 모킹
jest.mock("@/providers/DrawerProvider", () => ({
  useDrawer: jest.fn(),
}));

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"), // 다른 react-redux 기능은 그대로 사용
  useDispatch: jest.fn(),
}));

// 모킹된 훅을 타입과 함께 가져옵니다.
const mockUseDrawer = useDrawer as jest.Mock;
const mockUseDispatch = useDispatch as unknown as jest.Mock;

describe("AppHeader", () => {
  const mockDispatch = jest.fn();
  const mockSetDrawerOpen = jest.fn();

  // window.scrollTo를 모킹합니다.
  const mockScrollTo = jest.fn();
  Object.defineProperty(window, "scrollTo", {
    value: mockScrollTo,
    writable: true,
  });

  beforeEach(() => {
    // 각 테스트가 독립적으로 실행되도록 모킹된 함수들을 초기화합니다.
    mockUseDispatch.mockReturnValue(mockDispatch);
    mockUseDrawer.mockReturnValue({
      isDrawerOpen: false,
      drawerType: "temporary",
      setDrawerOpen: mockSetDrawerOpen,
    });
    jest.useFakeTimers(); // 디바운스 테스트를 위해 가짜 타이머를 사용합니다.
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers(); // 테스트 후 실제 타이머로 복원합니다.
  });

  it("should render correctly", () => {
    render(<AppHeader />);
    expect(screen.getByText("Github User Finder")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search…")).toBeInTheDocument();
    expect(screen.getByLabelText("github")).toBeInTheDocument();
  });

  it("should debounce search input and dispatch action", async () => {
    render(<AppHeader />);
    const searchInput = screen.getByPlaceholderText("Search…");

    // 사용자가 'test'를 입력합니다.
    fireEvent.change(searchInput, { target: { value: "test" } });

    // 디바운스 시간(500ms)이 아직 지나지 않았으므로 dispatch는 호출되지 않아야 합니다.
    expect(mockDispatch).not.toHaveBeenCalled();

    act(() => {
      // 타이머를 500ms 진행시킵니다.
      jest.advanceTimersByTime(500);
    });

    // 500ms 후 dispatch가 올바른 액션과 함께 호출되었는지 확인합니다.
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(setSearchString("test"));
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    // 사용자가 'secondtest'를 입력합니다.
    fireEvent.change(searchInput, { target: { value: "secondtest" } });

    act(() => {
      // 타이머를 500ms 진행시킵니다.
      jest.advanceTimersByTime(500);
    });

    // 500ms 후 dispatch가 올바른 액션과 함께 호출되었는지 확인합니다.
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(setSearchString("secondtest"));
      expect(mockDispatch).toHaveBeenCalledTimes(2);
    });
  });

  describe("Drawer Menu Button", () => {
    it("should be visible when drawerType is 'temporary'", () => {
      // beforeEach에서 이미 'temporary'로 설정됨
      render(<AppHeader />);
      expect(screen.getByLabelText("menu")).toBeInTheDocument();
    });

    it("should not be visible when drawerType is 'permanent'", () => {
      mockUseDrawer.mockReturnValue({
        ...mockUseDrawer(),
        drawerType: "permanent",
      });
      render(<AppHeader />);
      expect(screen.queryByLabelText("menu")).not.toBeInTheDocument();
    });

    it("should call setDrawerOpen when clicked", () => {
      mockUseDrawer.mockReturnValue({
        isDrawerOpen: false,
        drawerType: "temporary",
        setDrawerOpen: mockSetDrawerOpen,
      });
      render(<AppHeader />);
      const menuButton = screen.getByLabelText("menu");
      fireEvent.click(menuButton);

      // isDrawerOpen이 false였으므로, !false = true가 전달되어야 합니다.
      expect(mockSetDrawerOpen).toHaveBeenCalledWith(true);
      expect(mockSetDrawerOpen).toHaveBeenCalledTimes(1);
    });
  });

  it("should call window.scrollTo when logo is clicked", () => {
    render(<AppHeader />);
    const logoButton = screen.getByLabelText("github");
    fireEvent.click(logoButton);

    expect(mockScrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    expect(mockScrollTo).toHaveBeenCalledTimes(1);
  });

  it("should update input value when user types", () => {
    render(<AppHeader />);
    const searchInput = screen.getByPlaceholderText(
      "Search…"
    ) as HTMLInputElement;

    fireEvent.change(searchInput, { target: { value: "hello world" } });

    expect(searchInput.value).toBe("hello world");
  });
});
