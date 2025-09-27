"use client";

import { setSearchString } from "@/services/finderSlice";
import GitHubIcon from "@mui/icons-material/GitHub";
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
import { ReactNode, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useDebounce } from "use-debounce";

const SearchBar = styled("div")(({ theme }) => ({
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
}));

const SearchBarInput = styled(InputBase)(() => ({
  color: "inherit",
}));

export function AppHeader(): ReactNode {
  const [formString, setFormString] = useState("");
  const [value] = useDebounce(formString, 500);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSearchString(value));
  }, [value, dispatch]);

  return (
    <AppBar position="sticky">
      <Toolbar>
        <IconButton
          className="mr-2!"
          size="large"
          edge="start"
          color="inherit"
          aria-label="open drawer"
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
      </Toolbar>
    </AppBar>
  );
}
