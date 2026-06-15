import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
// import { ScrollToTop } from "@/components/ui/scroll-to-top"; // We'll create a small utility for this if needed, or just standard router behavior
import NotFound from "@/pages/not-found";
import Manifesto from "@/pages/Manifesto";
import Services from "@/pages/Services";
import Diagnosis from "@/pages/Diagnosis";
import AdminPortal from "@/pages/AdminPortal";
import QuoteApproval from "@/pages/QuoteApproval";
import { useEffect } from "react";
import { useLocation } from "wouter";

// Scroll to top on route change component
function ScrollToTopWrapper() {
  const [pathname] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTopWrapper />
      <Switch>
        <Route path="/" component={Manifesto} />
        <Route path="/services" component={Services} />
        <Route path="/diagnosis" component={Diagnosis} />
        <Route path="/admin" component={AdminPortal} />
        <Route path="/quote/:token" component={QuoteApproval} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
