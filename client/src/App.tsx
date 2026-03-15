import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Archive from "./pages/Archive";
import Explore from "./pages/Explore";
import Graph from "./pages/Graph";
import Districts from "./pages/Districts";
import DistrictDetail from "./pages/DistrictDetail";
import Symbols from "./pages/Symbols";
import Create from "./pages/Create";
import Mythology from "./pages/Mythology";
import TrackDetail from "./pages/TrackDetail";
import Search from "./pages/Search";
import Export from "./pages/Export";
import Layout from "./components/Layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/archive">
        <Layout><Archive /></Layout>
      </Route>
      <Route path="/explore">
        <Layout><Explore /></Layout>
      </Route>
      <Route path="/graph">
        <Layout><Graph /></Layout>
      </Route>
      <Route path="/districts">
        <Layout><Districts /></Layout>
      </Route>
      <Route path="/districts/:slug">
        <Layout><DistrictDetail /></Layout>
      </Route>
      <Route path="/symbols">
        <Layout><Symbols /></Layout>
      </Route>
      <Route path="/create">
        <Layout><Create /></Layout>
      </Route>
      <Route path="/mythology">
        <Layout><Mythology /></Layout>
      </Route>
      <Route path="/track/:id">
        <Layout><TrackDetail /></Layout>
      </Route>
      <Route path="/search">
        <Layout><Search /></Layout>
      </Route>
      <Route path="/export">
        <Layout><Export /></Layout>
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
