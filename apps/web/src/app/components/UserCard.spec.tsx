/**
 * @jest-environment jsdom
 */
import { GithubUser } from "@/types/user";
import { render, screen } from "@testing-library/react";
import { UserCard } from "./UserCard";

// AvatarCanvas는 자체적으로 복잡한 로직(WASM, fetch)을 가지므로 모킹합니다.
// UserCard 테스트에서는 AvatarCanvas가 올바른 props를 받았는지만 확인합니다.
jest.mock("./AvartarCanvas", () => ({
  __esModule: true,
  default: ({ imageUrl }: { imageUrl: string }) => (
    <div data-testid="mock-avatar-canvas" data-imageurl={imageUrl} />
  ),
}));

describe("UserCard", () => {
  describe("when user data is provided", () => {
    const mockUser: GithubUser = {
      id: 1,
      login: "testuser",
      avatar_url: "http://example.com/avatar.png",
      html_url: "http://github.com/testuser",
      type: "User",
    };

    it("should render user information correctly", () => {
      render(<UserCard user={mockUser} />);

      // 사용자 이름(login)이 링크와 함께 렌더링되는지 확인
      const userLink = screen.getByRole("link", { name: "testuser" });
      expect(userLink).toBeInTheDocument();
      expect(userLink).toHaveAttribute("href", mockUser.html_url);

      // 사용자 타입(type)이 렌더링되는지 확인
      expect(screen.getByText(mockUser.type)).toBeInTheDocument();

      // 모킹된 AvatarCanvas가 올바른 이미지 URL과 함께 렌더링되는지 확인
      const avatarCanvas = screen.getByTestId("mock-avatar-canvas");
      expect(avatarCanvas).toBeInTheDocument();
      expect(avatarCanvas).toHaveAttribute(
        "data-imageurl",
        mockUser.avatar_url
      );

      // 로딩 스켈레톤은 보이지 않아야 함
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
  });

  describe("when user data is not provided (loading state)", () => {
    it("should render loading skeletons", () => {
      render(<UserCard />);

      // 아바타 스켈레톤이 렌더링되는지 확인
      // MUI Skeleton은 기본적으로 progressbar 역할을 가집니다.
      // CardHeader의 avatar prop으로 전달된 Skeleton을 찾습니다.
      const avatarSkeletons = screen.getAllByRole("progressbar");
      expect(avatarSkeletons.length).toBeGreaterThan(0);
      // MUI Skeleton은 variant="circular"일 때 style에 border-radius: 50%를 가집니다.
      expect(avatarSkeletons[0]).toHaveStyle("border-radius: 50%");

      // 제목과 부제목 스켈레톤이 있는지 확인
      // CardHeader 내부에 여러 Skeleton이 있으므로, 2개 이상인지 확인
      const skeletons = screen.getAllByRole("progressbar");
      expect(skeletons.length).toBeGreaterThanOrEqual(2);

      // 실제 사용자 정보는 보이지 않아야 함
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });
  });
});
