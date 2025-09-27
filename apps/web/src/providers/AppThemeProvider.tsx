"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";

export const theme = createTheme({
  // palette: {
  //   primary: {
  //     main: purple[500],
  //   },
  // },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      "var(--font-noto-sans)",
      "var(--font-noto-mono)",
      "Helvetica",
      "sans-serif",
    ].join(","),
  },
  colorSchemes: {
    light: true,
    dark: true,
  },
  components: {
    // 스크롤바 가리면서 drawer 움직이는 부분 방지
    MuiModal: { defaultProps: { disableScrollLock: true } },
    MuiPopover: { defaultProps: { disableScrollLock: true } },
    MuiMenu: { defaultProps: { disableScrollLock: true } },
  },
});

export const AppThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
