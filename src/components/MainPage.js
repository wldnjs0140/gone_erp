import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/MainPage.css";
import LoginModal from "./LoginModal"; // LoginModal 컴포넌트 임포트

function MainPage({ setLoginModalOpen }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리
  const [username, setUsername] = useState(""); // 쿠키에서 가져온 사용자 이름 저장
  const [isModalOpen, setIsModalOpen] = useState(false); // 로그인 모달 상태
  const navigate = useNavigate();

  // 로그인 상태 확인 함수
  useEffect(() => {
    const storedUsername = getCookie("username");
    if (storedUsername) {
      setIsLoggedIn(true); // 쿠키에 username이 있다면 로그인 상태로 변경
      setUsername(storedUsername); // 사용자 이름 저장
    }
  }, []);

  // 쿠키에서 값을 가져오는 함수
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  // 로그인 버튼 클릭 시 처리
  const handleLoginClick = () => {
    setIsModalOpen(true); // 로그인 모달 열기
  };

  // 로그아웃 버튼 클릭 시 처리
  const handleLogoutClick = () => {
    // 쿠키에서 로그인 정보 삭제
    document.cookie = "username=; path=/; max-age=0"; // username 쿠키 삭제
    setIsLoggedIn(false); // 로그인 상태 변경
    setUsername(""); // 사용자 이름 초기화
    navigate("/"); // 홈 페이지로 이동
    alert("로그아웃되었습니다.");
  };

  // 메뉴 클릭 시 페이지 이동
  const handleMenuClick = (menu) => {
    if (menu === "Inventory") {
      navigate("/Inventory"); // 재고관리 메뉴 클릭 시 인벤토리 페이지로 이동
    }
    if (menu === "SalesPage") {
      navigate("/SalesPage"); // 재고관리 메뉴 클릭 시 인벤토리 페이지로 이동
    }
    if (menu === "hr") {
      navigate("/hr"); // 재고관리 메뉴 클릭 시 인벤토리 페이지로 이동
    }
  };

  return (
    <div className="main-page">
      <header>
        <span className="logo-img">
          <img
            src={process.env.PUBLIC_URL + "/erp_logo.png"}
            width="120px"
            height="78px"
            alt="logo-image"
          />
        </span>
        {/* 로그인 상태에 따라 버튼 표시 */}
        {!isLoggedIn ? (
          <button className="login-btn" onClick={handleLoginClick}>
            로그인
          </button>
        ) : (
          <div className="logged-in-info">
            <span>환영합니다, {username}님!</span>
            <button className="logout" onClick={handleLogoutClick}>
              로그아웃
            </button>
          </div>
        )}
      </header>

      <div className="menu-container">
        <div className="menu-item" onClick={() => handleMenuClick("Inventory")}>
          재고관리
        </div>
        <div className="menu-item" onClick={() => handleMenuClick("SalesPage")}>
          매출관리
        </div>
        <div className="menu-item" onClick={() => handleMenuClick("hr")}>
          인사관리
        </div>
      </div>

      <aside>
        <h2>공지사항</h2>
        <ol>
          <li>공지사항 1</li>
          <li>공지사항 2</li>
          <li>공지사항 3</li>
        </ol>
      </aside>

      {/* 로그인 모달 상태가 true일 때만 표시 */}
      {isModalOpen && (
        <LoginModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          setLoginStatus={setIsLoggedIn}
          setUsername={setUsername}
        />
      )}
    </div>
  );
}

export default MainPage;
