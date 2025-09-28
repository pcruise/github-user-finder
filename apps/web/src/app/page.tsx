import { AppThemeProvider } from "@/providers/AppThemeProvider";
import { DrawerProvider } from "@/providers/DrawerProvider";
import StoreProvider from "@/providers/StoreProvider";
import { Box, Container } from "@mui/material";
import { AppDrawer } from "./components/AppDrawer";
import { AppHeader } from "./components/AppHeader";
import { UserList } from "./components/UserList";

export default function Home() {
  return (
    <AppThemeProvider>
      <StoreProvider>
        <DrawerProvider>
          <Box className="flex flex-row w-full">
            <Box
              bgcolor="background.paper"
              className="min-h-50 mb-8 mt-0 mx-auto md:mt-8 w-full md:w-2xl lg:w-4xl xl:w-5xl 2xl:w-6xl"
            >
              <AppHeader />
              <Container component="main" className="p-3">
                <UserList />
              </Container>
            </Box>
            <AppDrawer />
          </Box>
        </DrawerProvider>
      </StoreProvider>
    </AppThemeProvider>
  );
}
