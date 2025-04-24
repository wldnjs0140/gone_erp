import React, { useState, forwardRef } from "react";

const AddEmployeeForm = forwardRef(({ closeModal, positions }, formRef) => {
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    phone: "",
    department: "",
    position: "",
    regDate: new Date().toISOString().split("T")[0],
    modDate: new Date().toISOString().split("T")[0],
    employmentStatus: "A",
  });
  const [errors, setErrors] = useState({});

  const generateEmployeeId = async () => {
    try {
      const response = await fetch("http://localhost:84/api/hr/generateCode", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.text();
      if (result.startsWith("EMP")) {
        setFormData((prev) => ({ ...prev, employeeId: result }));
        setErrors((prev) => ({ ...prev, employeeId: "" }));
      } else {
        alert("사번 생성 실패: " + result);
      }
    } catch (error) {
      alert("사번 생성 중 오류 발생: " + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.employeeId) newErrors.employeeId = "* 사번을 입력하세요";
    if (!formData.name) newErrors.name = "* 이름을 입력하세요";
    if (!formData.phone) newErrors.phone = "* 연락처를 입력하세요";
    if (!formData.department) newErrors.department = "* 부서를 선택하세요";
    if (!formData.position) newErrors.position = "* 직급을 선택하세요";
    if (!formData.regDate) newErrors.regDate = "* 등록일을 선택하세요";
    if (!formData.modDate) newErrors.modDate = "* 수정일을 선택하세요";
    if (!formData.employmentStatus)
      newErrors.employmentStatus = "* 재직 여부를 선택하세요";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch("http://localhost:84/api/hr/employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        alert("사원 등록 성공");
        closeModal();
      } else {
        alert(result.message || "사원 등록 실패");
      }
    } catch (error) {
      alert("사원 등록 중 오류 발생: " + error.message);
    }
  };
  // 날짜를 YYYY-MM-DD 형식으로 변환하는 함수
  function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0"); // 월은 0부터 시작하므로 +1
    const day = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // formData.regDate 값이 다른 형식일 때 변환하여 사용
  const formattedReg = formatDate(formData.regDate);
  const formattedMod = formatDate(formData.modDate);

  const handleCancel = () => {
    closeModal();
  };

  return (
    <div className="employee-form" ref={formRef}>
      <h2>사원 등록</h2>
      <form>
        <div className="form-row">
          <label>사번:</label>
          <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              readOnly
            />
            <button
              type="button"
              className="add-button"
              onClick={generateEmployeeId}
              style={{ marginLeft: "10px", padding: "5px 10px" }}
            >
              자동발급
            </button>
          </div>
          <span className="required">{errors.employeeId || ""}</span>
        </div>
        <div className="form-row">
          <label>이름:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
          <span className="required">{errors.name || ""}</span>
        </div>
        <div className="form-row">
          <label>연락처:</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
          <span className="required">{errors.phone || ""}</span>
        </div>
        <div className="form-row">
          <label>부서:</label>
          <select
            name="department"
            value={formData.department}
            onChange={handleInputChange}
          >
            <option value="">부서 선택</option>
            <option value="영업부">영업부</option>
            <option value="인사부">인사부</option>
            <option value="개발부">개발부</option>
            <option value="마케팅부">마케팅부</option>
          </select>
          <span className="required">{errors.department || ""}</span>
        </div>
        <div className="form-row">
          <label>직급:</label>
          <select
            name="position"
            value={formData.position}
            onChange={handleInputChange}
          >
            <option value="">직급 선택</option>
            {positions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
          <span className="required">{errors.position || ""}</span>
        </div>
        <div className="form-row">
          <label>등록일:</label>
          <input
            type="date"
            name="regDate"
            value={formattedReg}
            onChange={handleInputChange}
          />
          <span className="required">{errors.regDate || ""}</span>
        </div>
        <div className="form-row">
          <label>수정일:</label>
          <input
            type="date"
            name="modDate"
            value={formattedMod}
            onChange={handleInputChange}
          />
          <span className="required">{errors.modDate || ""}</span>
        </div>
        <div className="form-row">
          <label>재직 여부:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="employmentStatus"
                value="A"
                checked={formData.employmentStatus === "A"}
                onChange={handleInputChange}
              />
              재직
            </label>
            <label>
              <input
                type="radio"
                name="employmentStatus"
                value="L"
                checked={formData.employmentStatus === "L"}
                onChange={handleInputChange}
              />
              휴직
            </label>
            <label>
              <input
                type="radio"
                name="employmentStatus"
                value="R"
                checked={formData.employmentStatus === "R"}
                onChange={handleInputChange}
              />
              퇴직
            </label>
          </div>
          <span className="required">{errors.employmentStatus || ""}</span>
        </div>
        <div className="form-buttons">
          <button onClick={handleSubmit}>등록</button>
          <button onClick={handleCancel}>취소</button>
        </div>
      </form>
    </div>
  );
});

export default AddEmployeeForm;
