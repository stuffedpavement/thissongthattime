import { Switch, Route, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import NameSetup from "@/components/name-setup";
import Home from "@/pages/home";
import CreateStory from "@/pages/create-story";
import EditStory from "@/pages/edit-story";
import Discover from "@/pages/discover";
import StoryDetail from "@/pages/story-detail";
import Dashboard from "@/pages/dashboard";
import About from "@/pages/about";
import Feedback from "@/pages/feedback";
import NotFound from "@/pages/not-found";
import type { User } from "@shared/schema";
import { trackPageView } from "./lib/analytics";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create-story" component={CreateStory} />
      <Route path="/edit-story/:id" component={EditStory} />
      <Route path="/discover" component={Discover} />
      <Route path="/story/:id" component={StoryDetail} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/about" component={About} />
      <Route path="/feedback" component={Feedback} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();

  useEffect(() => {
    trackPageView(location);
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Router />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;