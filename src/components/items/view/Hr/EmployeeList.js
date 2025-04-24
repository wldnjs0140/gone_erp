import React, { useState, useRef, useEffect } from "react";
import EditEmployeeForm from "./EditEmployeeForm";

const EmployeeList = ({
  employeeKeyField,
  employeeKeyWord,
  handleEmployeeSearchChange,
  handleEmployeeKeyFieldChange,
  handleEmployeeSearchSubmit,
  selectedPositions,
  handlePositionCheckboxChange,
  allPositionsSelected,
  handleAllPositionsCheckboxChange,
  positions,
  selectedEmploymentStatuses,
  handleEmploymentStatusCheckboxChange,
  allEmploymentStatusesSelected,
  handleAllEmploymentStatusesCheckboxChange,
  employmentStatuses,
  filteredEmployees,
  handleEmployeePage,
  employeePage,
  employeeTotalPages,
  onEmployeeUpdate,
}) => {
  const employeesPerPage = 15;
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editErrors, setEditErrors] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);

  const editFormRef = useRef(null);
  const addFormRef = useRef(null);

  // AddEmployeeForm 상태
  const [addFormData, setAddFormData] = useState({
    employeeId: "",
    name: "",
    phone: "",
    department: "",
    position: "",
    regDate: new Date().toISOString().split("T")[0],
    modDate: new Date().toISOString().split("T")[0],
    employmentStatus: "A",
  });
  const [addErrors, setAddErrors] = useState({});

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleRowClick = (employee) => {
    setShowAddForm(false);
    setSelectedEmployee(employee);
    setEditFormData({
      ...employee,
      modDate: getTodayDate(),
    });
    setShowEditForm(true);
    setEditErrors({});
  };

  const handleAddEmployeeClick = () => {
    setShowEditForm(false);
    setShowAddForm(true);
  };

  const closeAddForm = () => {
    setShowAddForm(false);
    setAddFormData({
      employeeId: "",
      name: "",
      phone: "",
      department: "",
      position: "",
      regDate: new Date().toISOString().split("T")[0],
      modDate: new Date().toISOString().split("T")[0],
      employmentStatus: "A",
    });
    setAddErrors({});
    onEmployeeUpdate();
  };

  const generateEmployeeId = async () => {
    try {
      const response = await fetch("http://localhost:84/api/hr/generateCode", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.text();
      if (result.startsWith("EMP")) {
        setAddFormData((prev) => ({ ...prev, employeeId: result }));
        setAddErrors((prev) => ({ ...prev, employeeId: "" }));
      } else {
        alert("사번 생성 실패: " + result);
      }
    } catch (error) {
      alert("사번 생성 중 오류 발생: " + error.message);
    }
  };

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setAddErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateAddForm = () => {
    const newErrors = {};
    if (!addFormData.employeeId) newErrors.employeeId = "* 사번을 입력하세요";
    if (!addFormData.name) newErrors.name = "* 이름을 입력하세요";
    if (!addFormData.phone) newErrors.phone = "* 연락처를 입력하세요";
    if (!addFormData.department) newErrors.department = "* 부서를 선택하세요";
    if (!addFormData.position) newErrors.position = "* 직급을 선택하세요";
    if (!addFormData.regDate) newErrors.regDate = "* 등록일을 선택하세요";
    if (!addFormData.modDate) newErrors.modDate = "* 수정일을 선택하세요";
    if (!addFormData.employmentStatus)
      newErrors.employmentStatus = "* 재직 여부를 선택하세요";
    setAddErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateAddForm()) return;

    try {
      const response = await fetch("http://localhost:84/api/hr/employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addFormData),
      });
      const result = await response.json();
      if (result.success) {
        alert("사원 등록 성공");
        closeAddForm();
      } else {
        alert(result.message || "사원 등록 실패");
      }
    } catch (error) {
      alert("사원 등록 중 오류 발생: " + error.message);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (showAddForm && addFormRef.current) {
      const element = addFormRef.current;
      const rect = element.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const top = rect.top + scrollTop;

      window.scrollTo({
        top: top,
        behavior: "smooth",
      });
    }
  }, [showAddForm]);

  useEffect(() => {
    if (showEditForm && editFormRef.current) {
      const element = editFormRef.current;
      const rect = element.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const top = rect.top + scrollTop;

      window.scrollTo({
        top: top,
        behavior: "smooth",
      });
    }
  }, [showEditForm]);

  const handleSort = (key) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.key === key) {
        return {
          key,
          direction: prevConfig.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
    handleEmployeePage(1);
  };

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let valueA = a[sortConfig.key];
    let valueB = b[sortConfig.key];

    if (sortConfig.key === "regDate" || sortConfig.key === "modDate") {
      valueA = new Date(valueA);
      valueB = new Date(valueB);
    } else {
      valueA = valueA?.toLowerCase() || "";
      valueB = valueB?.toLowerCase() || "";
    }

    if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const startIndex = (employeePage - 1) * employeesPerPage;
  const paginatedEmployees = sortedEmployees.slice(
    startIndex,
    startIndex + employeesPerPage
  );

  // 페이징 블록 계산 (최대 5개)
  const pageNumbers = () => {
    const range = [];
    const maxPage = Math.min(5, employeeTotalPages);
    let start = Math.max(1, employeePage - 2);
    let end = start + maxPage - 1;

    if (end > employeeTotalPages) {
      start = Math.max(1, employeeTotalPages - maxPage + 1);
      end = employeeTotalPages;
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  };

  return (
    <div className="empList">
      <div className="search-bar">
        <select
          value={employeeKeyField}
          onChange={handleEmployeeKeyFieldChange}
        >
          <option value="">검색 항목 선택</option>
          <option value="employeeId">사번</option>
          <option value="name">이름</option>
          <option value="department">부서명</option>
        </select>
        <input
          type="text"
          value={employeeKeyWord}
          onChange={handleEmployeeSearchChange}
          placeholder="검색어 입력"
        />
        <button onClick={handleEmployeeSearchSubmit}>검색</button>
      </div>

      <div className="position-filter">
        <label className="position-filter-label">
          <input
            type="checkbox"
            checked={allPositionsSelected}
            onChange={handleAllPositionsCheckboxChange}
          />
          모든직급
        </label>
        {positions.map((position) => (
          <label key={position} className="position-filter-label">
            <input
              type="checkbox"
              checked={selectedPositions.includes(position)}
              onChange={() => handlePositionCheckboxChange(position)}
            />
            {position}
          </label>
        ))}
      </div>

      <div className="employment-status-filter">
        <label className="employment-status-filter-label">
          <input
            type="checkbox"
            checked={allEmploymentStatusesSelected}
            onChange={handleAllEmploymentStatusesCheckboxChange}
          />
          모든상태
        </label>
        {employmentStatuses.map((status) => (
          <label key={status.value} className="employment-status-filter-label">
            <input
              type="checkbox"
              checked={selectedEmploymentStatuses.includes(status.value)}
              onChange={() =>
                handleEmploymentStatusCheckboxChange(status.value)
              }
            />
            {status.label}
          </label>
        ))}
      </div>

      <button className="add-emp-button" onClick={handleAddEmployeeClick}>
        사원 등록
      </button>

      <table>
        <thead>
          <tr>
            <th
              onClick={() => handleSort("employeeId")}
              className="sortable-header"
            >
              사번
            </th>
            <th>사원명</th>
            <th>연락처</th>
            <th
              onClick={() => handleSort("department")}
              className="sortable-header"
            >
              부서명
            </th>
            <th
              onClick={() => handleSort("position")}
              className="sortable-header"
            >
              직급
            </th>
            <th
              onClick={() => handleSort("regDate")}
              className="sortable-header"
            >
              등록일
            </th>
            <th
              onClick={() => handleSort("modDate")}
              className="sortable-header"
            >
              수정일
            </th>
            <th
              onClick={() => handleSort("employmentStatus")}
              className="sortable-header"
            >
              재직상태
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedEmployees.map((employee) => (
            <tr
              key={employee.employeeId}
              onClick={() => handleRowClick(employee)}
              className={
                selectedEmployee?.employeeId === employee.employeeId
                  ? "selected"
                  : ""
              }
            >
              <td>{employee.employeeId}</td>
              <td>{employee.name}</td>
              <td>{employee.phone}</td>
              <td>{employee.department}</td>
              <td>{employee.position}</td>
              <td>{employee.regDate}</td>
              <td>{employee.modDate || "-"}</td>
              <td>{employee.employmentStatusDisplay}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        {employeePage > 1 && employeeTotalPages > 5 && (
          <button
            onClick={() => handleEmployeePage(1)}
            className="arrow first-page"
          >
            {"<<"}
          </button>
        )}
        {employeePage > 1 && (
          <button
            onClick={() => handleEmployeePage(employeePage - 1)}
            className="arrow left-arrow"
          >
            {"<"}
          </button>
        )}
        {pageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => handleEmployeePage(page)}
            className={employeePage === page ? "active" : ""}
          >
            {page}
          </button>
        ))}
        {employeePage < employeeTotalPages && (
          <button
            onClick={() => handleEmployeePage(employeePage + 1)}
            className="arrow right-arrow"
          >
            {">"}
          </button>
        )}
        {employeePage < employeeTotalPages && employeeTotalPages > 5 && (
          <button
            onClick={() => handleEmployeePage(employeeTotalPages)}
            className="arrow last-page"
          >
            {">>"}
          </button>
        )}
      </div>

      {showEditForm && editFormData && (
        <EditEmployeeForm
          formData={editFormData}
          handleInputChange={(e) => {
            const { name, value } = e.target;
            let formattedValue = value;
            if (name === "regDate" || name === "modDate") {
              const date = new Date(value);
              if (!isNaN(date)) {
                formattedValue = date.toISOString().split("T")[0];
              }
            }
            setEditFormData((prev) => ({
              ...prev,
              [name]: formattedValue,
            }));
            setEditErrors((prev) => ({
              ...prev,
              [name]: "",
            }));
          }}
          errors={editErrors}
          handleSave={async () => {
            const newErrors = {};
            if (!editFormData.name) newErrors.name = "* 이름을 입력하세요";
            if (!editFormData.phone) newErrors.phone = "* 연락처를 입력하세요";
            if (!editFormData.department)
              newErrors.department = "* 부서를 선택하세요";
            if (!editFormData.position)
              newErrors.position = "* 직급을 선택하세요";
            if (!editFormData.regDate)
              newErrors.regDate = "* 등록일을 선택하세요";
            if (!editFormData.modDate)
              newErrors.modDate = "* 수정일을 선택하세요";
            if (!editFormData.employmentStatus)
              newErrors.employmentStatus = "* 재직 여부를 선택하세요";
            setEditErrors(newErrors);
            if (Object.keys(newErrors).length > 0) return;

            try {
              const response = await fetch(
                "http://localhost:84/api/hr/employee/update",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(editFormData),
                }
              );
              const result = await response.json();
              if (result.success) {
                alert("사원 정보가 수정되었습니다.");
                filteredEmployees.splice(
                  0,
                  filteredEmployees.length,
                  ...filteredEmployees.map((emp) =>
                    emp.employeeId === editFormData.employeeId
                      ? editFormData
                      : emp
                  )
                );
                setShowEditForm(false);
                onEmployeeUpdate();
              } else {
                alert("사원 정보 수정 실패: " + result.message);
              }
            } catch (error) {
              console.error("사원 정보 수정 실패:", error);
              alert("사원 정보 수정 중 오류가 발생했습니다.");
            }
          }}
          handleCancel={() => {
            setShowEditForm(false);
            setSelectedEmployee(null);
            setEditFormData(null);
            setEditErrors({});
          }}
          positions={positions}
          formRef={editFormRef}
        />
      )}

      {showAddForm && (
        <div className="employee-form" ref={addFormRef}>
          <h2>사원 등록</h2>
          <form>
            <div className="form-row">
              <label>사번:</label>
              <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <input
                  type="text"
                  name="employeeId"
                  value={addFormData.employeeId}
                  onChange={handleAddInputChange}
                  readOnly
                />
                <button
                  type="button"
                  className="add-id-btn"
                  onClick={generateEmployeeId}
                >
                  자동발급
                </button>
              </div>
              <span className="required">{addErrors.employeeId || ""}</span>
            </div>
            <div className="form-row">
              <label>이름:</label>
              <input
                type="text"
                name="name"
                value={addFormData.name}
                onChange={handleAddInputChange}
              />
              <span className="required">{addErrors.name || ""}</span>
            </div>
            <div className="form-row">
              <label>연락처:</label>
              <input
                type="text"
                name="phone"
                value={addFormData.phone}
                onChange={handleAddInputChange}
              />
              <span className="required">{addErrors.phone || ""}</span>
            </div>
            <div className="form-row">
              <label>부서:</label>
              <select
                name="department"
                value={addFormData.department}
                onChange={handleAddInputChange}
              >
                <option value="">부서 선택</option>
                <option value="영업부">영업부</option>
                <option value="인사부">인사부</option>
                <option value="개발부">개발부</option>
                <option value="마케팅부">마케팅부</option>
              </select>
              <span className="required">{addErrors.department || ""}</span>
            </div>
            <div className="form-row">
              <label>직급:</label>
              <select
                name="position"
                value={addFormData.position}
                onChange={handleAddInputChange}
              >
                <option value="">직급 선택</option>
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
              <span className="required">{addErrors.position || ""}</span>
            </div>
            <div className="form-row">
              <label>등록일:</label>
              <input
                type="date"
                name="regDate"
                value={formatDate(addFormData.regDate)}
                onChange={handleAddInputChange}
              />
              <span className="required">{addErrors.regDate || ""}</span>
            </div>
            <div className="form-row">
              <label>수정일:</label>
              <input
                type="date"
                name="modDate"
                value={formatDate(addFormData.modDate)}
                onChange={handleAddInputChange}
              />
              <span className="required">{addErrors.modDate || ""}</span>
            </div>
            <div className="form-row">
              <label>재직 여부:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="employmentStatus"
                    value="A"
                    checked={addFormData.employmentStatus === "A"}
                    onChange={handleAddInputChange}
                  />
                  재직
                </label>
                <label>
                  <input
                    type="radio"
                    name="employmentStatus"
                    value="L"
                    checked={addFormData.employmentStatus === "L"}
                    onChange={handleAddInputChange}
                  />
                  휴직
                </label>
                <label>
                  <input
                    type="radio"
                    name="employmentStatus"
                    value="R"
                    checked={addFormData.employmentStatus === "R"}
                    onChange={handleAddInputChange}
                  />
                  퇴직
                </label>
              </div>
              <span className="required">
                {addErrors.employmentStatus || ""}
              </span>
            </div>
            <div className="form-buttons">
              <button className="add-btn" onClick={handleAddSubmit}>
                등록
              </button>
              <button className="cancel-btn" onClick={closeAddForm}>
                취소
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
