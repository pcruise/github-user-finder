"use client";

import { useDrawer } from "@/providers/DrawerProvider";
import { setSearchString } from "@/services/finderSlice";
import GitHubIcon from "@mui/icons-material/GitHub";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import {
  alpha,
  AppBar,
  IconButton,
  InputBase,
  styled,
  Toolbar,
  Typography,
} from "@mui/material";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useDebounce } from "use-debounce";

/**
 * 검색창의 스타일을 정의하는 컴포넌트입니다.
 */
const SearchBar = styled("div")(({ theme }) => ({
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
}));
/**
 * 검색창 내부 Input의 스타일을 정의하는 컴포넌트입니다.
 */
const SearchBarInput = styled(InputBase)(() => ({
  color: "inherit",
}));

/**
 * 애플리케이션의 헤더 컴포넌트입니다.
 * 로고, 애플리케이션 이름, 사용자 검색을 위한 검색창을 포함합니다.
 * 검색어는 디바운싱 처리되어 Redux 스토어에 저장됩니다.
 * Drawer가 열고 닫기 가능한 상황이라면 Drawer를 여는 버튼이 출력됩니다.
 */
export function AppHeader(): ReactNode {
  const [formString, setFormString] = useState("");
  const [debouncedFormString] = useDebounce(formString, 500);
  const dispatch = useDispatch();
  const { drawerType, setDrawerOpen, isDrawerOpen } = useDrawer();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      // 초기 state 설정값은 호출하지 않습니다.
      isFirst.current = false;
      return;
    }
    dispatch(setSearchString(debouncedFormString));
  }, [debouncedFormString, dispatch]);

  return (
    <AppBar position="sticky">
      <Toolbar>
        <IconButton
          className="mr-2!"
          size="large"
          edge="start"
          color="inherit"
          aria-label="github"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <GitHubIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          className="hidden sm:block grow-1"
        >
          Github User Finder
        </Typography>
        <SearchBar className="flex flex-row relative rounded-sm p-1 pr-0 w-full sm:w-xs">
          <div className="flex justify-center items-center px-1">
            <SearchIcon />
          </div>
          <SearchBarInput
            className="flex w-full text-inherit"
            slotProps={{ input: { className: "w-full text-inherit" } }}
            placeholder="Search…"
            onChange={(e) => setFormString(e.target.value)}
            inputProps={{ "aria-label": "search" }}
          />
        </SearchBar>
        {drawerType === "temporary" && (
          <IconButton
            edge="end"
            color="inherit"
            aria-label="open filter drawer"
            className="ml-2!"
            onClick={() => setDrawerOpen(!isDrawerOpen)}
          >
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
}
