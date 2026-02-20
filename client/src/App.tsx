import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import EmployeeDashboard from "@/pages/employee/EmployeeDashboard";
import SendInvitation from "@/pages/employee/SendInvitation";
import VisitorRegistration from "@/pages/visitor/VisitorRegistration";
import InvitationAccept from "@/pages/visitor/InvitationAccept";
import WatchmanDashboard from "@/pages/watchman/WatchmanDashboard";
import ScanQRPage from "@/pages/watchman/ScanQRPage";
import VisitorDetailsPage from "@/pages/watchman/VisitorDetailsPage";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      
      {/* Visitor Public Routes */}
      <Route path="/visitor/register" component={VisitorRegistration} />
      <Route path="/visitor/invitation/:token" component={InvitationAccept} />

      {/* Protected Employee Routes */}
      <Route path="/employee/dashboard" component={EmployeeDashboard} />
      <Route path="/employee/invite" component={SendInvitation} />

      {/* Protected Watchman Routes */}
      <Route path="/watchman/dashboard" component={WatchmanDashboard} />
      <Route path="/watchman/scan" component={ScanQRPage} />
      <Route path="/watchman/visitor/:id" component={VisitorDetailsPage} />

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
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
