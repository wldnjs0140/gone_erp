import React from "react";

const EditEmployeeForm = ({
  formData,
  handleInputChange,
  errors,
  handleSave,
  handleCancel,
  positions,
  formRef,
}) => {
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
  return (
    <div className="employee-form" ref={formRef}>
      <h2>사원 정보 수정</h2>
      <form>
        <div className="form-row">
          <label>사번:</label>
          <input
            type="text"
            name="employeeId"
            value={formData.employeeId}
            readOnly
          />
          <span className="required"></span>
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
          <button className="add-btn" onClick={handleSave}>
            저장
          </button>
          <button className="cancel-btn" onClick={handleCancel}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEmployeeForm;
