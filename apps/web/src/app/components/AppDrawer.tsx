"use client";

import { Box, Drawer } from "@mui/material";
import { ReactNode } from "react";
import SearchFilters from "./SearchFilters";
import { DEFAULT_DRAWER_WIDTH, useDrawer } from "@/providers/DrawerProvider";

export function AppDrawer(): ReactNode {
  {
    const { isDrawerOpen, drawerType, drawerWidth, setDrawerOpen } =
      useDrawer();

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
          <SearchFilters />
        </Drawer>
      </Box>
    );
  }
}
