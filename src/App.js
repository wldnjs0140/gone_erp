import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import MainPage from "./components/MainPage";
import LoginModal from "./components/LoginModal";
import InventoryPage from "./components/InventoryPage";
import SalesPage from "./components/SalesPage";
import HRPage from "./components/HRPage";

function App() {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={<MainPage setLoginModalOpen={setLoginModalOpen} />}
        />
        <Route path="/Inventory" element={<InventoryPage />} />
        <Route path="/SalesPage" element={<SalesPage />} />
        <Route path="/hr" element={<HRPage />} />
        <Route
          path="*"
          element={<MainPage setLoginModalOpen={setLoginModalOpen} />}
        />
      </Routes>

      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setLoginModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
