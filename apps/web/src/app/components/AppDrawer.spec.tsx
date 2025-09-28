/**
 * @jest-environment jsdom
 */
import { useDrawer } from "@/providers/DrawerProvider";
import { fireEvent, render, screen } from "@testing-library/react";
import { AppDrawer } from "./AppDrawer";

// useDrawer 훅 모킹
jest.mock("@/providers/DrawerProvider", () => ({
  // DEFAULT_DRAWER_WIDTH는 실제 값을 사용하거나 테스트용 값을 지정합니다.
  DEFAULT_DRAWER_WIDTH: 240,
  useDrawer: jest.fn(),
}));

// SearchFilters 컴포넌트 모킹 (AppDrawer의 테스트에 집중하기 위함)
jest.mock("./SearchFilters", () => ({
  __esModule: true,
  default: () => <div>MockedSearchFilters</div>,
}));

// 모킹된 useDrawer를 타입과 함께 가져옵니다.
const mockUseDrawer = useDrawer as jest.Mock;

describe("AppDrawer", () => {
  // 각 테스트 후 모킹된 함수 기록 초기화
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("when drawerType is 'temporary'", () => {
    const setDrawerOpen = jest.fn();

    beforeEach(() => {
      // 'temporary' drawer가 열려있는 상황을 시뮬레이션
      mockUseDrawer.mockReturnValue({
        isDrawerOpen: true,
        drawerType: "temporary",
        drawerWidth: 280,
        setDrawerOpen,
      });
    });

    it("should render the drawer with SearchFilters and a close button", () => {
      render(<AppDrawer />);

      // Drawer는 'dialog' 역할을 가집니다.
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      // 모킹된 SearchFilters가 렌더링되었는지 확인
      expect(screen.getByText("MockedSearchFilters")).toBeInTheDocument();
      // 닫기 버튼(ChevronLeftIcon)이 있는지 확인
      expect(
        screen.getByRole("button", { name: /close drawer/i })
      ).toBeInTheDocument();
    });

    it("should call setDrawerOpen(false) when the close button is clicked", () => {
      render(<AppDrawer />);

      const closeButton = screen.getByRole("button", { name: /close drawer/i });
      fireEvent.click(closeButton);

      expect(setDrawerOpen).toHaveBeenCalledWith(false);
      expect(setDrawerOpen).toHaveBeenCalledTimes(1);
    });

    it("should call setDrawerOpen(false) on backdrop click (onClose event)", () => {
      render(<AppDrawer />);

      // MUI Drawer의 backdrop 클릭은 내부적으로 onClose를 호출합니다.
      // 여기서는 onClose가 호출되는지 직접 테스트합니다.
      const dialog = screen.getByRole("dialog");
      // onClose는 일반적으로 dialog의 부모 div에서 keydown 이벤트(Escape)나 외부 클릭으로 트리거됩니다.
      // fireEvent.keyDown(dialog, { key: 'Escape' }); // 이 방법도 가능합니다.

      // MUI는 `onClose`를 호출하는 로직을 내부에 가지고 있으므로,
      // 여기서는 `onClose` prop이 올바르게 전달되었는지만 확인하는 것이 더 정확한 단위 테스트입니다.
      // 하지만 상호작용을 테스트하기 위해 이벤트를 시뮬레이션합니다.
      // 실제로는 Drawer의 onClose prop을 직접 호출하는 것이 더 단위 테스트에 가깝습니다.
      // 예: `screen.getByRole('dialog').props.onClose()` -> 하지만 RTL은 이런 방식을 권장하지 않습니다.
      // 사용자가 상호작용하는 방식을 테스트합니다.
      fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });

      expect(setDrawerOpen).toHaveBeenCalledWith(false);
    });
  });

  describe("when drawerType is 'permanent'", () => {
    const setDrawerOpen = jest.fn();

    beforeEach(() => {
      // 'permanent' drawer 상황 시뮬레이션
      mockUseDrawer.mockReturnValue({
        isDrawerOpen: true, // permanent는 항상 열려있다고 가정
        drawerType: "permanent",
        drawerWidth: 280,
        setDrawerOpen,
      });
    });

    it("should render the drawer without a close button", () => {
      render(<AppDrawer />);

      // permanent Drawer는 'presentation' 역할을 가지지 않고, nav 영역의 일부로 렌더링됩니다.
      expect(screen.getByText("MockedSearchFilters")).toBeInTheDocument();
      // 닫기 버튼이 없어야 합니다.
      expect(
        screen.queryByRole("button", { name: /close drawer/i })
      ).not.toBeInTheDocument();
    });
  });

  it("should not be visible when isDrawerOpen is false", () => {
    mockUseDrawer.mockReturnValue({
      isDrawerOpen: false,
      drawerType: "temporary",
      drawerWidth: 280,
      setDrawerOpen: jest.fn(),
    });

    render(<AppDrawer />);

    // Drawer가 닫혀있을 때 dialog 역할의 엘리먼트는 DOM에 없습니다.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
