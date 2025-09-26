import { GithubUser } from "@/types/user";
import {
  Avatar,
  Box,
  Card,
  CardHeader,
  Link,
  Skeleton,
  Typography,
} from "@mui/material";
import { ReactNode } from "react";

export function UserCard({ user }: { user?: GithubUser }): ReactNode {
  return (
    <li className="block">
      <Card>
        {user ? <UserCardContent user={user} /> : <UserCardLoading />}
      </Card>
    </li>
  );
}

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
          className="whitespace-pre overflow-ellipsis overflow-hidden block"
        >
          {user.login}
        </Link>
      }
      subheader={<span className="text-xs">{user.type}</span>}
      avatar={<Avatar src={user.avatar_url} />}
    />
  );
};

const UserCardLoading = () => (
  <CardHeader
    title={<Skeleton />}
    subheader={<Skeleton width={"40%"} />}
    avatar={<Skeleton variant="circular" width={"32px"} height={"32px"} />}
  />
);
