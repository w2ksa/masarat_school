import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminControl from "./pages/AdminControl";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherVoting from "./pages/TeacherVoting";
import TeacherSelect from "./pages/TeacherSelect";
import TeacherLogin from "./pages/TeacherLogin";
import StudentManagement from "./pages/StudentManagement";
import Dashboard from "./pages/Dashboard";
import VotingReport from "./pages/VotingReport";
import ActivityLog from "./pages/ActivityLog";
import SubmitContent from "./pages/SubmitContent";
import ContentManagement from "./pages/ContentManagement";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/admin"} component={AdminControl} />
       <Route path={"/admin/students"} component={StudentManagement} />
      <Route path={"/admin/voting-report"} component={VotingReport} />
      <Route path={"/admin/activity-log"} component={ActivityLog} />
      <Route path={"/admin/content"} component={ContentManagement} />
      <Route path={"/submit-content"} component={SubmitContent} />
      <Route path={"/admin-old"} component={AdminDashboard} />
      <Route path="/teacher/login" component={TeacherLogin} />
      <Route path="/teacher/select" component={TeacherSelect} />
      <Route path="/teacher/voting" component={TeacherVoting} />
      <Route path={"/teacher-old"} component={TeacherDashboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
