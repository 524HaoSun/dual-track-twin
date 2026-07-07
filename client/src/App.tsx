import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DataProvider } from "./contexts/DataContext";
import { NavProvider } from "./contexts/NavContext";
import { AppShell } from "./components/AppShell";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <DataProvider>
          <NavProvider>
            <TooltipProvider>
              <Toaster />
              <AppShell />
            </TooltipProvider>
          </NavProvider>
        </DataProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
