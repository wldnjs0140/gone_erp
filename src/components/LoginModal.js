import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/LoginModal.css";

function LoginModal({ isOpen, onClose, setLoginStatus, setUsername }) {
  const [id, setId] = useState("admin_general");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id === "" || password === "") {
      setError("아이디와 비밀번호를 입력하세요.");
    } else {
      fetch("http://localhost:84/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: id,
          password: password,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // 로그인 성공 시 쿠키에 로그인 정보 저장
            document.cookie = `username=${id}; path=/; max-age=3600`; // 쿠키에 로그인 정보 저장 (1시간 유지)
            document.cookie = `isLoggedIn=true; path=/; max-age=3600`; // 로그인 상태 저장

            alert("로그인 성공!");
            setLoginStatus(true); // 로그인 상태 변경
            setUsername(id); // 사용자 이름 설정
            onClose(); // 로그인 모달 닫기
            navigate("/"); // 메인 페이지로 이동
          } else {
            setError("아이디 또는 비밀번호가 틀립니다.");
          }
        })
        .catch((error) => {
          console.error("로그인 실패:", error);
          setError("서버와 연결할 수 없습니다.");
        });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>아이디</label>
          <input
            className="login-input"
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </div>
        <div>
          <label>비밀번호</label>
          <input
            className="login-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="button-group">
          <button type="submit">로그인</button>
          <button className="login-modal-close" onClick={onClose}>
            닫기
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginModal;
