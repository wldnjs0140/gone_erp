import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "../css/Header.css";

function Header() {
  const navigate = useNavigate();
  const location = useLocation(); // 현재 경로 가져오기

  // 활성 탭 설정
  const getActiveTab = () => {
    switch (location.pathname) {
      case "/inventory":
        return "inventory";
      case "/SalesPage":
        return "SalesPage";
      case "/hr":
        return "hr";
      default:
        return "inventory";
    }
  };

  const goMain = () => {
    navigate("/");
  };

  // 로그아웃 처리
  const handleLogout = () => {
    document.cookie = "username=; path=/; max-age=0"; // username 쿠키 삭제
    alert("로그아웃되었습니다.");
    navigate("/"); // 로그아웃 후 메인 페이지로 이동
  };

  return (
    <header className="header">
      <button className="logo-btn" onClick={goMain}>
        <div className="logo-wrapper">
          <img
            src={process.env.PUBLIC_URL + "/erp_logo.png"}
            width="120px"
            height="78px"
            alt="logo-image"
          />
          <span className="tooltip">메인페이지로 이동</span>
        </div>
      </button>
      <nav className="header-nav">
        <button
          className={getActiveTab() === "inventory" ? "active" : ""}
          onClick={() => navigate("/inventory")}
        >
          재고관리
        </button>
        <button
          className={getActiveTab() === "SalesPage" ? "active" : ""}
          onClick={() => navigate("/SalesPage")}
        >
          매출관리
        </button>
        <button
          className={getActiveTab() === "hr" ? "active" : ""}
          onClick={() => navigate("/hr")}
        >
          인사관리
        </button>
        <button className="logout" onClick={handleLogout}>
          로그아웃
        </button>
      </nav>
    </header>
  );
}

export default Header;
