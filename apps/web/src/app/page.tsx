import { Suspense } from "react";
import { Box, Container } from "@mui/material";

import StoreProvider from "@/StoreProvider";
import { AppHeader } from "./components/AppHeader";
import { AppList } from "./components/AppList";

export default function Home() {
  return (
    <Box className="bg-white min-h-50 mb-8 mt-0 mx-auto md:mt-8 sm:max-w-full md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
      <StoreProvider>
        <AppHeader />
        <Container component="main" className="p-3">
          <ul className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            <AppList />
          </ul>
        </Container>
      </StoreProvider>
    </Box>
  );
}
