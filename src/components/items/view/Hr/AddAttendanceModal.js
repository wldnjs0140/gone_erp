import React, { useState, useEffect } from "react";

const AddAttendanceModal = ({ closeModal, initialData, isEditMode }) => {
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [newAttendance, setNewAttendance] = useState({
    employeeId: "",
    employeeName: "",
    attendanceDate: getTodayDate(),
    checkInTime: "",
    checkOutTime: "",
    status: "",
    note: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  // initialData가 있을 경우 초기값 설정
  useEffect(() => {
    if (initialData) {
      setNewAttendance({
        employeeId: initialData.employeeId || "",
        employeeName: initialData.employeeName || "",
        attendanceDate: initialData.attendanceDate || getTodayDate(),
        checkInTime: initialData.checkInTime || "",
        checkOutTime: initialData.checkOutTime || "",
        status: initialData.status || "",
        note: initialData.note || "",
      });
    }
  }, [initialData]);

  const checkEmployeeDetails = async (employeeId, employeeName) => {
    try {
      const response = await fetch(
        `http://localhost:84/api/hr/employees?employeeId=${employeeId}`
      );
      const result = await response.json();
      console.log("API Response for employeeId", employeeId, ":", result);

      if (
        result.success &&
        Array.isArray(result.data) &&
        result.data.length > 0
      ) {
        const employee = result.data[0];
        return {
          exists: true,
          matchesName: employee.name === employeeName,
          actualName: employee.name,
        };
      } else if (!result.success) {
        console.error("API failed:", result.message);
        return {
          exists: false,
          matchesName: false,
          actualName: null,
          error: result.message,
        };
      }
      return { exists: false, matchesName: false, actualName: null };
    } catch (error) {
      console.error("Error checking employee details:", error);
      return {
        exists: false,
        matchesName: false,
        actualName: null,
        error: "서버와의 연결에 실패했습니다.",
      };
    }
  };

  const validateAttendance = async (attendance) => {
    const errors = {};

    // 수정 모드에서는 사번과 사원명 검증을 생략 (readOnly이므로 변경되지 않음)
    if (!isEditMode) {
      if (
        !attendance.employeeId ||
        !/^EMP\d{3,}$/.test(attendance.employeeId)
      ) {
        errors.employeeId =
          "사원번호는 'EMP'로 시작하고 숫자가 최소 3자리 이상이어야 합니다. (예: EMP001, EMP1234)";
      } else {
        const { exists, matchesName, actualName, error } =
          await checkEmployeeDetails(
            attendance.employeeId,
            attendance.employeeName
          );
        if (!exists) {
          errors.employeeId = error
            ? `존재하지 않는 사원번호입니다. (에러: ${error})`
            : "존재하지 않는 사원번호입니다.";
        } else if (!matchesName) {
          errors.employeeName = `사원명 '${attendance.employeeName}'이(가) 사원번호 '${attendance.employeeId}'에 등록된 이름 '${actualName}'과 일치하지 않습니다.`;
        }
      }

      if (!attendance.employeeName || attendance.employeeName.length < 2) {
        errors.employeeName = "사원명은 2자 이상이어야 합니다.";
      }
    }

    if (
      !attendance.attendanceDate ||
      !/^\d{4}-\d{2}-\d{2}$/.test(attendance.attendanceDate)
    ) {
      errors.attendanceDate = "날짜는 YYYY-MM-DD 형식이어야 합니다.";
    }

    if (
      attendance.checkInTime &&
      !/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(attendance.checkInTime)
    ) {
      errors.checkInTime = "출근시간은 HH:MM 형식이어야 합니다.";
    }

    if (
      attendance.checkOutTime &&
      !/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(attendance.checkOutTime)
    ) {
      errors.checkOutTime = "퇴근시간은 HH:MM 형식이어야 합니다.";
    }

    const validStatuses = ["출근", "결근", "조퇴", "휴가"];
    if (!attendance.status || !validStatuses.includes(attendance.status)) {
      errors.status = "근태상태를 선택해주세요.";
    }

    return errors;
  };

  const handleSubmit = async () => {
    const errors = await validateAttendance(newAttendance);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const url = isEditMode
        ? `http://localhost:84/api/hr/updateAttendance/${initialData.attendanceId}`
        : "http://localhost:84/api/hr/addAttendance";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAttendance),
      });

      // 응답 상태 코드 확인
      if (!response.ok) {
        const text = await response.text();
        console.error(
          "Response status:",
          response.status,
          "Response text:",
          text
        );
        throw new Error(
          `HTTP error! status: ${response.status}, response: ${text}`
        );
      }

      const result = await response.json();
      if (result.success) {
        alert(
          isEditMode
            ? "근태 정보가 수정되었습니다."
            : "근태 등록이 완료되었습니다."
        );
        closeModal();
      } else {
        setValidationErrors({
          ...validationErrors,
          general:
            result.message ||
            (isEditMode
              ? "근태 수정에 실패했습니다."
              : "근태 등록에 실패했습니다."),
        });
      }
    } catch (error) {
      console.error(
        isEditMode ? "근태 수정 중 오류 발생:" : "근태 등록 중 오류 발생:",
        error
      );
      setValidationErrors({
        ...validationErrors,
        general: error.message || "서버와의 연결에 실패했습니다.",
      });
    }
  };

  return (
    <div className="attendance-modal-overlay">
      <div className="attendance-modal-content">
        <h2 className="attendance-modal-title">
          {isEditMode ? "근태 수정" : "근태 등록"}
        </h2>
        {validationErrors.general && (
          <p className="attendance-error-message attendance-error-message-general">
            {validationErrors.general}
          </p>
        )}
        <div className="attendance-modal-input-group">
          <label className="attendance-modal-label">사원번호:</label>
          <div className="attendance-input-wrapper">
            <input
              type="text"
              className="attendance-modal-input"
              placeholder="사원번호 (예: EMP001)"
              value={newAttendance.employeeId}
              onChange={(e) =>
                setNewAttendance({
                  ...newAttendance,
                  employeeId: e.target.value.toUpperCase(),
                })
              }
              readOnly={isEditMode} // 수정 모드에서 readOnly 설정
            />
            {validationErrors.employeeId && (
              <p className="attendance-error-message">
                {validationErrors.employeeId}
              </p>
            )}
          </div>
        </div>
        <div className="attendance-modal-input-group">
          <label className="attendance-modal-label">사원명:</label>
          <div className="attendance-input-wrapper">
            <input
              type="text"
              className="attendance-modal-input"
              placeholder="사원명 (2자 이상)"
              value={newAttendance.employeeName}
              onChange={(e) =>
                setNewAttendance({
                  ...newAttendance,
                  employeeName: e.target.value,
                })
              }
              readOnly={isEditMode} // 수정 모드에서 readOnly 설정
            />
            {validationErrors.employeeName && (
              <p className="attendance-error-message">
                {validationErrors.employeeName}
              </p>
            )}
          </div>
        </div>
        <div className="attendance-modal-input-group">
          <label className="attendance-modal-label">날짜:</label>
          <div className="attendance-input-wrapper">
            <input
              type="date"
              className="attendance-modal-input"
              value={newAttendance.attendanceDate}
              onChange={(e) =>
                setNewAttendance({
                  ...newAttendance,
                  attendanceDate: e.target.value,
                })
              }
            />
            {validationErrors.attendanceDate && (
              <p className="attendance-error-message">
                {validationErrors.attendanceDate}
              </p>
            )}
          </div>
        </div>
        <div className="attendance-modal-input-group">
          <label className="attendance-modal-label">출근시간:</label>
          <div className="attendance-input-wrapper">
            <input
              type="time"
              className="attendance-modal-input"
              value={newAttendance.checkInTime}
              onChange={(e) =>
                setNewAttendance({
                  ...newAttendance,
                  checkInTime: e.target.value,
                })
              }
            />
            {validationErrors.checkInTime && (
              <p className="attendance-error-message">
                {validationErrors.checkInTime}
              </p>
            )}
          </div>
        </div>
        <div className="attendance-modal-input-group">
          <label className="attendance-modal-label">퇴근시간:</label>
          <div className="attendance-input-wrapper">
            <input
              type="time"
              className="attendance-modal-input"
              value={newAttendance.checkOutTime}
              onChange={(e) =>
                setNewAttendance({
                  ...newAttendance,
                  checkOutTime: e.target.value,
                })
              }
            />
            {validationErrors.checkOutTime && (
              <p className="attendance-error-message">
                {validationErrors.checkOutTime}
              </p>
            )}
          </div>
        </div>
        <div className="attendance-modal-input-group">
          <label className="attendance-modal-label">근태상태:</label>
          <div className="attendance-input-wrapper">
            <div className="attendance-radio-group">
              <label className="attendance-radio-label">
                <input
                  type="radio"
                  value="출근"
                  checked={newAttendance.status === "출근"}
                  onChange={(e) =>
                    setNewAttendance({
                      ...newAttendance,
                      status: e.target.value,
                    })
                  }
                />
                출근
              </label>
              <label className="attendance-radio-label">
                <input
                  type="radio"
                  value="결근"
                  checked={newAttendance.status === "결근"}
                  onChange={(e) =>
                    setNewAttendance({
                      ...newAttendance,
                      status: e.target.value,
                    })
                  }
                />
                결근
              </label>
              <label className="attendance-radio-label">
                <input
                  type="radio"
                  value="조퇴"
                  checked={newAttendance.status === "조퇴"}
                  onChange={(e) =>
                    setNewAttendance({
                      ...newAttendance,
                      status: e.target.value,
                    })
                  }
                />
                조퇴
              </label>
              <label className="attendance-radio-label">
                <input
                  type="radio"
                  value="휴가"
                  checked={newAttendance.status === "휴가"}
                  onChange={(e) =>
                    setNewAttendance({
                      ...newAttendance,
                      status: e.target.value,
                    })
                  }
                />
                휴가
              </label>
            </div>
            {validationErrors.status && (
              <p className="attendance-error-message">
                {validationErrors.status}
              </p>
            )}
          </div>
        </div>
        <div className="attendance-modal-input-group">
          <label className="attendance-modal-label">비고:</label>
          <div className="attendance-textarea-wrapper">
            <textarea
              className="attendance-modal-textarea"
              placeholder="비고"
              value={newAttendance.note}
              onChange={(e) =>
                setNewAttendance({ ...newAttendance, note: e.target.value })
              }
            />
          </div>
        </div>
        <div className="attendance-modal-buttons">
          <button className="attendance-add-btn" onClick={handleSubmit}>
            {isEditMode ? "수정" : "등록"}
          </button>
          <button className="attendance-cancel-btn" onClick={closeModal}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAttendanceModal;
