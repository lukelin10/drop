import { Toaster } from "@/components/ui/toaster";
import AppLayout from "./components/AppLayout";
import ThemeSwitcher from "./components/ThemeSwitcher";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import Journal from "./pages/Journal";
import Feed from "./pages/Feed";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen w-full flex flex-col items-center bg-gray-100 p-6">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-poppins font-bold mb-2">Drop App</h1>
            <p className="text-gray-600">Prototype with Theme Switching</p>
            <ThemeSwitcher />
          </div>

          <AppLayout>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/journal" component={Journal} />
              <Route path="/feed" component={Feed} />
              <Route component={NotFound} />
            </Switch>
          </AppLayout>
        </div>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
