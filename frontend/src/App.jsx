import { Navigate, Route, Routes } from "react-router-dom";
import WorkspacePage from "./pages/WorkspacePage.jsx";

export default function App() {
  return (
    <Routes>
      {/* Main application */}
      <Route
        path="/"
        element={<WorkspacePage />}
      />

      {/* Any unknown route goes back to workspace */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}