import { GithubUser } from "@/types/user";
import { Card, CardHeader, Link, Skeleton } from "@mui/material";
import { ReactNode } from "react";
import AvatarCanvas from "./AvartarCanvas";

/**
 * GitHub 사용자 정보를 표시하는 카드 컴포넌트입니다.
 * user 데이터가 있으면 UserCardContent를, 없으면 로딩 스켈레톤을 표시합니다.
 * @param {object} props - 컴포넌트 props
 * @param {GithubUser} [props.user] - 표시할 GitHub 사용자 정보
 */
export function UserCard({ user }: { user?: GithubUser }): ReactNode {
  return (
    <li className="block">
      <Card>
        {user ? <UserCardContent user={user} /> : <UserCardLoading />}
      </Card>
    </li>
  );
}

/**
 * 사용자 정보를 표시하는 UserCard의 컨텐츠 컴포넌트입니다.
 * @param {object} props - 컴포넌트 props
 * @param {GithubUser} props.user - 표시할 GitHub 사용자 정보
 */
const UserCardContent = ({ user }: { user: GithubUser }) => {
  return (
    <CardHeader
      className="relative"
      slotProps={{ content: { className: "min-w-0" } }} // 이름 넘치는 부분 픽스
      title={
        <Link
          href={user.html_url}
          color="inherit"
          target="_blank"
          rel="noreferrer"
          underline="hover"
          // 긴 사용자 이름이 다음 줄로 넘어가지 않고 말줄임표(...)로 표시되도록 설정
          className="whitespace-pre overflow-ellipsis overflow-hidden block"
        >
          {user.login}
        </Link>
      }
      subheader={<span className="text-xs">{user.type}</span>}
      avatar={<AvatarCanvas imageUrl={user.avatar_url} />}
    />
  );
};

/**
 * UserCard의 로딩 상태를 표시하는 스켈레톤 컴포넌트입니다.
 */
const UserCardLoading = () => (
  <CardHeader
    title={<Skeleton role="progressbar" />}
    subheader={<Skeleton width={"40%"} role="progressbar" />}
    avatar={
      <Skeleton
        variant="circular"
        width={"40px"}
        height={"40px"}
        role="progressbar"
      />
    }
  />
);
