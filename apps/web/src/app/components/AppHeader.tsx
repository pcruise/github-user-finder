"use client";

import { setSearchString } from "@/services/finderSlice";
import GitHubIcon from "@mui/icons-material/GitHub";
import {
  AppBar,
  IconButton,
  InputBase,
  Toolbar,
  Typography,
} from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useDebounce } from "use-debounce";

export function AppHeader(): ReactNode {
  const [formString, setFormString] = useState("");
  const [value] = useDebounce(formString, 500);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSearchString(value));
  }, [value]);

  return (
    <AppBar position="sticky">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="open drawer"
          sx={{ mr: 2 }}
        >
          <GitHubIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1 }}
          className="hidden sm:block"
        >
          Github User Finder
        </Typography>
        <div>
          <InputBase
            placeholder="Search…"
            inputProps={{ "aria-label": "search" }}
            onChange={(e) => setFormString(e.target.value)}
          />
        </div>
      </Toolbar>
    </AppBar>
  );
}
