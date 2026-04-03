import { Routes, Route, Navigate } from "react-router-dom";
import ClientPage from "./components/client/ClientPage";
import './App.css'
import CreateFieldPage from "./webcast_fields/CreateFieldPage";


function App() {
  return (
    <Routes>
      {/* Default Route */}
      <Route path="/" element={<Navigate to="/client" />} />

      {/* Client Page */}
      <Route path="/client" element={<ClientPage />} />

      {/* Create field Page */}
      <Route path="/create-field/:webcastId" element={<CreateFieldPage />} />

      {/* 404 Page (optional) */}
      <Route path="*" element={<h2>Page Not Found</h2>} />
    </Routes>
  );
}

export default App;