"use client";

import { DEFAULT_DRAWER_WIDTH, useDrawer } from "@/providers/DrawerProvider";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Box, Drawer, IconButton } from "@mui/material";
import { ReactNode } from "react";
import SearchFilters from "./SearchFilters";

/**
 * 애플리케이션의 검색 필터 옵션을 담는 Drawer 컴포넌트입니다.
 * `useDrawer` 훅을 사용하여 Drawer의 상태(열림/닫힘, 타입, 너비)를 관리합니다.
 * 데스크탑 뷰에서는 영구적인 Drawer로, 모바일 뷰에서는 일시적인 Drawer로 동작합니다.
 * @returns {React.ReactNode} AppDrawer 컴포넌트
 */
export function AppDrawer(): ReactNode {
  const { isDrawerOpen, drawerType, drawerWidth, setDrawerOpen } = useDrawer();

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: drawerWidth ?? DEFAULT_DRAWER_WIDTH },
        flexShrink: { sm: 0 },
      }}
    >
      <Drawer
        variant={drawerType}
        open={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        anchor="right"
        slotProps={{ paper: { className: "w-sm p-4" } }}
      >
        {drawerType === "temporary" && (
          <div className="flex justify-end">
            <IconButton
              onClick={() => setDrawerOpen(false)}
              aria-label="close drawer"
            >
              <ChevronLeftIcon />
            </IconButton>
          </div>
        )}
        <SearchFilters />
      </Drawer>
    </Box>
  );
}
