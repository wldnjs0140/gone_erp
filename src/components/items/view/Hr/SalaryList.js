import React, { useState, useEffect } from "react";
import AddSalaryModal from "./AddSalaryModal";

function SalaryList({
  salaries,
  salaryPage,
  salaryTotalPages,
  handleSalaryPage,
  yearFilter,
  setYearFilter,
  monthFilter,
  setMonthFilter,
  availableYears,
  availableMonths,
  setRefreshTrigger, // setRefreshTrigger prop 추가
}) {
  const salariesPerPage = 15;
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchKeyField, setSearchKeyField] = useState("");
  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [filteredSalaries, setFilteredSalaries] = useState(salaries);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [showAddSalaryModal, setShowAddSalaryModal] = useState(false); // 등록 모달 상태 추가

  const normalizePaymentDate = (paymentDate) => {
    if (paymentDate.includes("-")) {
      const [year, month, day] = paymentDate.split("-");
      return `${year.slice(2)}/${month}/${day}`;
    }
    return paymentDate;
  };

  useEffect(() => {
    setFilteredSalaries(salaries);
  }, [salaries]);

  useEffect(() => {
    if (!searchKeyField || !searchKeyWord) {
      setFilteredSalaries(salaries);
      return;
    }

    const filtered = salaries.filter((salary) => {
      let value = salary[searchKeyField]?.toString().toLowerCase() || "";
      if (searchKeyField === "paymentDate") {
        value = normalizePaymentDate(salary.paymentDate).toLowerCase();
      }
      return value.includes(searchKeyWord.toLowerCase());
    });

    setFilteredSalaries(filtered);
    handleSalaryPage(1);
  }, [searchKeyField, searchKeyWord, salaries, handleSalaryPage]);

  const sortedSalaries = [...filteredSalaries].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let valueA = a[sortConfig.key];
    let valueB = b[sortConfig.key];

    if (
      sortConfig.key === "totalWorkDays" ||
      sortConfig.key === "baseSalary" ||
      sortConfig.key === "bonusSalary" ||
      sortConfig.key === "finalSalary"
    ) {
      valueA = Number(valueA);
      valueB = Number(valueB);
    } else if (sortConfig.key === "paymentDate") {
      valueA = new Date(
        `20${normalizePaymentDate(a.paymentDate).split("/").join("-")}`
      );
      valueB = new Date(
        `20${normalizePaymentDate(b.paymentDate).split("/").join("-")}`
      );
    } else {
      valueA = valueA?.toLowerCase() || "";
      valueB = valueB?.toLowerCase() || "";
    }

    if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const startIndex = (salaryPage - 1) * salariesPerPage;
  const paginatedSalaries = sortedSalaries.slice(
    startIndex,
    startIndex + salariesPerPage
  );

  const filteredTotalPages = Math.ceil(
    filteredSalaries.length / salariesPerPage
  );
  const totalPages = Math.min(filteredTotalPages, salaryTotalPages);

  const pageNumbers = () => {
    const range = [];
    const maxPage = Math.min(5, totalPages);
    let start = Math.max(1, salaryPage - 2);
    let end = start + maxPage - 1;

    if (end > totalPages) {
      start = Math.max(1, totalPages - maxPage + 1);
      end = totalPages;
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  };

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
    handleSalaryPage(1);
  };

  const handleSearchSubmit = () => {
    if (!searchKeyField) {
      alert("검색할 항목을 선택하세요.");
      return;
    }
    handleSalaryPage(1);
  };

  const handleRowClick = (salary) => {
    setSelectedSalary(salary);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedSalary(null);
  };

  const openAddSalaryModal = () => {
    setShowAddSalaryModal(true);
  };

  const closeAddModal = () => {
    setShowAddSalaryModal(false);
  };

  return (
    <div className="salList">
      <div className="search-bar">
        <select
          value={yearFilter}
          onChange={(e) => {
            setYearFilter(e.target.value);
            setMonthFilter("");
          }}
        >
          <option value="">년도</option>
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        >
          <option value="">월</option>
          {availableMonths.map((month) => (
            <option key={month} value={month}>
              {parseInt(month, 10)}월
            </option>
          ))}
        </select>
      </div>

      <button className="add-sal-button" onClick={openAddSalaryModal}>
        급여 등록
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
            <th
              onClick={() => handleSort("totalWorkDays")}
              className="sortable-header"
            >
              총근무일수
            </th>
            <th
              onClick={() => handleSort("baseSalary")}
              className="sortable-header"
            >
              기본급여
            </th>
            <th
              onClick={() => handleSort("bonusSalary")}
              className="sortable-header"
            >
              성과급
            </th>
            <th
              onClick={() => handleSort("finalSalary")}
              className="sortable-header"
            >
              최종급여
            </th>
            <th
              onClick={() => handleSort("paymentDate")}
              className="sortable-header"
            >
              급여지급일
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedSalaries.length > 0 ? (
            paginatedSalaries.map((salary) => (
              <tr
                key={salary.salaryId}
                onClick={() => handleRowClick(salary)}
                style={{ cursor: "pointer" }}
              >
                <td>{salary.employeeId}</td>
                <td>{salary.employeeName || "-"}</td>
                <td>{salary.totalWorkDays}</td>
                <td>{salary.baseSalary}</td>
                <td>{salary.bonusSalary}</td>
                <td>{salary.finalSalary}</td>
                <td>{normalizePaymentDate(salary.paymentDate)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="search-bar bottom-search-bar">
        <select
          value={searchKeyField}
          onChange={(e) => setSearchKeyField(e.target.value)}
        >
          <option value="">검색 항목 선택</option>
          <option value="employeeId">사번</option>
          <option value="employeeName">사원명</option>
          <option value="paymentDate">급여지급일</option>
        </select>
        <input
          type="text"
          value={searchKeyWord}
          onChange={(e) => setSearchKeyWord(e.target.value)}
          placeholder="검색어를 입력하세요"
        />
        <button onClick={handleSearchSubmit}>검색</button>
      </div>

      <div className="pagination">
        {salaryPage > 1 && (
          <button
            onClick={() => handleSalaryPage(1)}
            className="arrow first-page"
          >
            {"<<"}
          </button>
        )}
        {salaryPage > 1 && (
          <button
            onClick={() => handleSalaryPage(salaryPage - 1)}
            className="arrow left-arrow"
          >
            {"<"}
          </button>
        )}
        {pageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => handleSalaryPage(page)}
            className={salaryPage === page ? "active" : ""}
          >
            {page}
          </button>
        ))}
        {salaryPage < totalPages && (
          <button
            onClick={() => handleSalaryPage(salaryPage + 1)}
            className="arrow right-arrow"
          >
            {">"}
          </button>
        )}
        {salaryPage < totalPages && (
          <button
            onClick={() => handleSalaryPage(totalPages)}
            className="arrow last-page"
          >
            {">>"}
          </button>
        )}
      </div>

      {showEditModal && (
        <div className="popup-overlay">
          <AddSalaryModal
            closeModal={closeEditModal}
            initialData={selectedSalary}
            isEditMode={true}
            setRefreshTrigger={setRefreshTrigger} // 수정 모드에서도 새로고침
          />
        </div>
      )}
      {showAddSalaryModal && (
        <div className="popup-overlay">
          <AddSalaryModal
            closeModal={closeAddModal}
            isEditMode={false}
            setRefreshTrigger={setRefreshTrigger} // 등록 모드에서 새로고침
          />
        </div>
      )}
    </div>
  );
}

export default SalaryList;
