import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";

function Router() {
  return (
    <Switch>
      <Route path={"/nf-giaminola2025/adminadmin"} component={Admin} />
      <Route path={"/nf-giaminola2025/adminadmin/"} component={Admin} />
      <Route path={"/adminadmin"} component={Admin} />
      <Route path={"/adminadmin/"} component={Admin} />
      <Route path={"/404"} component={NotFound} />
      <Route path={"*"} component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
