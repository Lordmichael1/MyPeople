import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import App from "./App"; // or a dashboard page
import { PrivateRoute } from "./components/PrivateRoute";
import Login from "./components/pages/Login";
import Signup from "./components/pages/Signup";

export default function Nav() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <App />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
