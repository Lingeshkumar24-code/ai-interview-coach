import LandingPage from "../pages/LandingPage.jsx";
import RoleSelectionPage from "../pages/RoleSelectionPage.jsx";
import InterviewPage from "../pages/InterviewPage.jsx";
import ResultsPage from "../pages/ResultsPage.jsx";
import AnalyticsPage from "../pages/AnalyticsPage.jsx";

export const routes = [
  { path: "/", element: <LandingPage /> },
  { path: "/setup", element: <RoleSelectionPage /> },
  { path: "/interview", element: <InterviewPage /> },
  { path: "/results", element: <ResultsPage /> },
  { path: "/analytics", element: <AnalyticsPage /> },
];
