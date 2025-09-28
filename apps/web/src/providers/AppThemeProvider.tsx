"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";

/**
 * 애플리케이션 전체에서 사용될 MUI 테마 객체입니다.
 */
export const theme = createTheme({
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
  cssVariables: {
    colorSchemeSelector: "data",
  },
  components: {
    // 스크롤바 가리면서 drawer 움직이는 부분 방지
    MuiModal: { defaultProps: { disableScrollLock: true } },
    MuiPopover: { defaultProps: { disableScrollLock: true } },
    MuiMenu: { defaultProps: { disableScrollLock: true } },
  },
});

/**
 * 애플리케이션에 MUI 테마를 적용하는 ThemeProvider 래퍼 컴포넌트입니다.
 * @param {object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 자식 컴포넌트
 */
export const AppThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
