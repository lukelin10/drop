import { Toaster } from "@/components/ui/toaster";
import AppLayout from "./components/AppLayout";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import Journal from "./pages/Journal";
import Feed from "./pages/Feed";
import NewIconOptions from "./pages/NewIconOptions";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Switch>
          <Route path="/icons">
            <NewIconOptions />
          </Route>
          <Route>
            <AppLayout>
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/journal" component={Journal} />
                <Route path="/feed" component={Feed} />
                <Route component={NotFound} />
              </Switch>
            </AppLayout>
          </Route>
        </Switch>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
