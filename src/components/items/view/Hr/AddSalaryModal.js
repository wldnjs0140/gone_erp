import React, { useState } from "react";

function AddSalaryModal({
  closeModal,
  initialData,
  isEditMode,
  setRefreshTrigger,
}) {
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // PAYMENT_DATE 형식 변환 (YY/MM/DD -> YYYY-MM-DD)
  const normalizePaymentDateForInput = (paymentDate) => {
    if (!paymentDate) return getTodayDate();
    if (paymentDate.includes("/")) {
      const [year, month, day] = paymentDate.split("/");
      return `20${year}-${month}-${day}`; // "24/01/25" -> "2024-01-25"
    }
    return paymentDate;
  };

  const [formData, setFormData] = useState({
    employeeId: initialData?.employeeId || "",
    employeeName: initialData?.employeeName || "",
    totalWorkDays: initialData?.totalWorkDays || "",
    baseSalary: initialData?.baseSalary || "",
    bonusSalary: initialData?.bonusSalary || "",
    finalSalary: initialData?.finalSalary || "",
    paymentDate: initialData?.paymentDate
      ? normalizePaymentDateForInput(initialData.paymentDate)
      : getTodayDate(),
    additionalBonus: initialData?.additionalBonus || "",
  });

  const [error, setError] = useState("");

  // 사번 유효성 검사: 대문자 영어 + 3자리 이상 숫자
  const validateEmployeeId = (id) => {
    const regex = /^[A-Z]+\d{3,}$/;
    return regex.test(id);
  };

  // 사번 입력 시 대문자로 변환
  const handleEmployeeIdChange = (e) => {
    const value = e.target.value.toUpperCase();
    setFormData({ ...formData, employeeId: value });
    if (!validateEmployeeId(value)) {
      setError(
        "사번은 대문자 영어와 3자리 이상 숫자로 입력해주세요 (예: E001)"
      );
    } else {
      setError("");
    }
  };

  // 계급별 기본급여 및 성과급 계산
  const calculateSalary = (position, totalWorkDays) => {
    const baseSalaries = {
      주임: 2600000,
      대리: 3100000,
      과장: 3600000,
      차장: 4100000,
      부장: 5000000,
    };

    const dailyBonusRates = {
      주임: 15000,
      대리: 15000,
      과장: 20000,
      차장: 25000,
      부장: 30000,
    };

    const baseSalary = baseSalaries[position] || 0;
    const dailyBonus = dailyBonusRates[position] || 0;
    const bonusSalary = totalWorkDays >= 17 ? totalWorkDays * dailyBonus : 0;
    const finalSalary = baseSalary + bonusSalary;

    return { baseSalary, bonusSalary, finalSalary };
  };

  // 사번 조회
  const handleEmployeeLookup = async () => {
    if (!validateEmployeeId(formData.employeeId)) {
      alert("유효한 사번을 입력해주세요.");
      return;
    }

    try {
      // 사원 정보 조회
      const employeeRes = await fetch(
        `http://localhost:84/api/hr/employees?employeeId=${formData.employeeId}`
      );
      const employeeData = await employeeRes.json();

      if (
        !employeeData.success ||
        !employeeData.data ||
        employeeData.data.length === 0
      ) {
        alert("사원을 찾을 수 없습니다.");
        return;
      }

      const employee = employeeData.data[0];
      setFormData((prev) => ({
        ...prev,
        employeeName: employee.name,
      }));

      // 당월 근무일수 조회
      const [year, month] = formData.paymentDate.split("-");
      const attendanceRes = await fetch(
        `http://localhost:84/api/hr/attendances?employeeId=${formData.employeeId}&year=${year}&month=${month}`
      );
      const attendanceData = await attendanceRes.json();

      let totalWorkDays = 0;
      if (attendanceData.success && attendanceData.data) {
        totalWorkDays = attendanceData.data.length; // 해당 사원의 근무일수 계산
      }

      // 급여 계산
      const { baseSalary, bonusSalary, finalSalary } = calculateSalary(
        employee.position,
        totalWorkDays
      );

      setFormData((prev) => ({
        ...prev,
        totalWorkDays: totalWorkDays.toString(),
        baseSalary: baseSalary.toString(),
        bonusSalary: bonusSalary.toString(),
        finalSalary: finalSalary.toString(),
      }));
    } catch (error) {
      alert("사원 조회 중 오류 발생: " + error.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmployeeId(formData.employeeId)) {
      alert("유효한 사번을 입력해주세요.");
      return;
    }

    try {
      const url = isEditMode
        ? `http://localhost:84/api/hr/updateSalary/${initialData.salaryId}`
        : "http://localhost:84/api/hr/addSalary";
      const method = "POST"; // 항상 POST로 설정

      const response = await fetch(url, {
        method, // "POST"
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          totalWorkDays: parseInt(formData.totalWorkDays),
          baseSalary: parseFloat(formData.baseSalary),
          bonusSalary: parseFloat(formData.bonusSalary),
          finalSalary: parseFloat(formData.finalSalary),
          additionalBonus: isEditMode
            ? parseFloat(formData.additionalBonus) || 0
            : undefined,
          paymentDate: formData.paymentDate,
        }),
      });
      const result = await response.json();
      if (result.success) {
        alert(isEditMode ? "급여 수정 성공" : "급여 등록 성공");
        setRefreshTrigger((prev) => prev + 1);
        closeModal();
      } else {
        alert(
          result.message || (isEditMode ? "급여 수정 실패" : "급여 등록 실패")
        );
      }
    } catch (error) {
      alert(
        (isEditMode ? "급여 수정" : "급여 등록") +
          " 중 오류 발생: " +
          error.message
      );
    }
  };

  return (
    <div className="Salary-popup-overlay">
      <div className="Salary-popup">
        <h2>{isEditMode ? "급여 수정" : "급여 등록"}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <label style={{ flex: 1 }}>
              <span>사번</span>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleEmployeeIdChange}
                required
                disabled={isEditMode}
              />
            </label>
            {!isEditMode && (
              <button
                type="button"
                className="salary-chk-btn"
                onClick={handleEmployeeLookup}
              >
                사번 조회
              </button>
            )}
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div>
            <label>
              <span>사원명</span>
              <input
                type="text"
                name="employeeName"
                value={formData.employeeName}
                onChange={handleChange}
                disabled
              />
            </label>
          </div>
          <div>
            <label>
              <span>총근무일수</span>
              <input
                type="number"
                name="totalWorkDays"
                value={formData.totalWorkDays}
                onChange={handleChange}
                required
                disabled
              />
            </label>
          </div>
          <div>
            <label>
              <span>기본급여</span>
              <input
                type="number"
                name="baseSalary"
                value={formData.baseSalary}
                onChange={handleChange}
                required
                disabled
              />
            </label>
          </div>
          <div>
            <label>
              <span>성과급</span>
              <input
                type="number"
                name="bonusSalary"
                value={formData.bonusSalary}
                onChange={handleChange}
                required
                disabled
              />
            </label>
          </div>
          {isEditMode && (
            <div>
              <label>
                <span>추가 보너스</span>
                <input
                  type="number"
                  name="additionalBonus"
                  value={formData.additionalBonus}
                  onChange={handleChange}
                />
              </label>
            </div>
          )}
          <div>
            <label>
              <span>최종급여</span>
              <input
                type="number"
                name="finalSalary"
                value={formData.finalSalary}
                onChange={handleChange}
                required
                disabled
              />
            </label>
          </div>
          <div>
            <label>
              <span>급여지급일</span>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <div className="salary-modal-buttons">
            <button className="salary-add-btn">
              {isEditMode ? "수정" : "등록"}
            </button>
            <button className="salary-cancel-btn" onClick={closeModal}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddSalaryModal;
