"use client";

import { useMediaQuery } from "@mui/material";
import React, { createContext, useContext, useState, useMemo } from "react";

interface DrawerContextType {
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  isDesktop: boolean;
  drawerType: "permanent" | "temporary";
  drawerWidth: number;
}

const DrawerContext = createContext<DrawerContextType | null>(null);
export const DEFAULT_DRAWER_WIDTH = 384 as const; // tailwind sm size

export const DrawerProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width:64rem)"); // tailwind md size

  const value = useMemo(() => {
    const drawerType = isDesktop ? "permanent" : "temporary";
    return {
      isDrawerOpen,
      drawerType,
      drawerWidth: isDesktop
        ? DEFAULT_DRAWER_WIDTH
        : isDrawerOpen
          ? DEFAULT_DRAWER_WIDTH
          : 0,
      setDrawerOpen,
      isDesktop,
    } as DrawerContextType;
  }, [isDrawerOpen, isDesktop]);

  return (
    <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
  );
};

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawer must be used within a DrawerProvider");
  }
  return context;
};
