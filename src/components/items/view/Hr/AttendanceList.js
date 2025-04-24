import React, { useState, useEffect } from "react";

const AttendanceList = ({
  attendances,
  attendancePage,
  handleAttendancePage,
  openAddAttendanceModal,
}) => {
  const attendancesPerPage = 15;
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [, setSelectedAttendance] = useState(null);
  const [searchField, setSearchField] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filteredAttendances, setFilteredAttendances] = useState(attendances);

  // 검색 및 필터링 로직
  useEffect(() => {
    if (!searchField || !searchKeyword) {
      setFilteredAttendances(attendances);
      return;
    }

    const filtered = attendances.filter((attendance) => {
      const value = attendance[searchField]?.toLowerCase() || "";
      return value.includes(searchKeyword.toLowerCase());
    });

    setFilteredAttendances(filtered);
    handleAttendancePage(1);
  }, [searchField, searchKeyword, attendances, handleAttendancePage]);

  // 정렬된 데이터 계산
  const sortedAttendances = [...filteredAttendances].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let valueA = a[sortConfig.key];
    let valueB = b[sortConfig.key];

    if (sortConfig.key === "attendanceDate") {
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

  // 페이징 처리
  const startIndex = (attendancePage - 1) * attendancesPerPage;
  const paginatedAttendances = sortedAttendances.slice(
    startIndex,
    startIndex + attendancesPerPage
  );

  // 검색 후 총 페이지 수 계산
  const totalPages = Math.ceil(filteredAttendances.length / attendancesPerPage);

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
    handleAttendancePage(1);
  };

  const handleRowClick = (attendance) => {
    setSelectedAttendance(attendance);
    openAddAttendanceModal("edit", attendance);
  };

  const handleSearchSubmit = () => {
    if (!searchField) {
      alert("검색할 항목을 선택하세요.");
      return;
    }
    handleAttendancePage(1);
  };

  // 페이징 블록 계산 (최대 5개)
  const pageNumbers = () => {
    const range = [];
    const maxPage = Math.min(5, totalPages);
    let start = Math.max(1, attendancePage - 2);
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

  return (
    <div className="attList">
      <button
        className="add-att-button"
        onClick={() => {
          setSelectedAttendance(null);
          openAddAttendanceModal("individual");
        }}
      >
        근태 등록
      </button>

      <table>
        <thead>
          <tr>
            <th
              onClick={() => handleSort("employeeId")}
              className="sortable-header"
            >
              사원번호
            </th>
            <th>사원명</th>
            <th
              onClick={() => handleSort("attendanceDate")}
              className="sortable-header"
            >
              날짜
            </th>
            <th
              onClick={() => handleSort("checkInTime")}
              className="sortable-header"
            >
              출근시간
            </th>
            <th
              onClick={() => handleSort("checkOutTime")}
              className="sortable-header"
            >
              퇴근시간
            </th>
            <th
              onClick={() => handleSort("status")}
              className="sortable-header"
            >
              근태상태
            </th>
            <th onClick={() => handleSort("note")} className="sortable-header">
              비고
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedAttendances.map((attendance) => (
            <tr
              key={attendance.attendanceId}
              onClick={() => handleRowClick(attendance)}
              style={{ cursor: "pointer" }}
            >
              <td>{attendance.employeeId}</td>
              <td>{attendance.employeeName || "-"}</td>
              <td>{attendance.attendanceDate}</td>
              <td>{attendance.checkInTime || "-"}</td>
              <td>{attendance.checkOutTime || "-"}</td>
              <td>{attendance.status}</td>
              <td>{attendance.note || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 검색창 */}
      <div className="search-bar">
        <select
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
          className="search-field"
        >
          <option value="">검색 항목 선택</option>
          <option value="employeeId">사원번호</option>
          <option value="employeeName">사원명</option>
          <option value="attendanceDate">날짜</option>
          <option value="status">근태상태</option>
        </select>
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="search-input"
        />
        <button onClick={handleSearchSubmit} className="search-button">
          검색
        </button>
      </div>

      {/* 페이징 */}
      <div className="pagination">
        {attendancePage > 1 && (
          <button
            onClick={() => handleAttendancePage(1)}
            className="arrow first-page"
          >
            {"<<"}
          </button>
        )}
        {attendancePage > 1 && (
          <button
            onClick={() => handleAttendancePage(attendancePage - 1)}
            className="arrow left-arrow"
          >
            {"<"}
          </button>
        )}
        {pageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => handleAttendancePage(page)}
            className={attendancePage === page ? "active" : ""}
          >
            {page}
          </button>
        ))}
        {attendancePage < totalPages && (
          <button
            onClick={() => handleAttendancePage(attendancePage + 1)}
            className="arrow right-arrow"
          >
            {">"}
          </button>
        )}
        {attendancePage < totalPages && (
          <button
            onClick={() => handleAttendancePage(totalPages)}
            className="arrow last-page"
          >
            {">>"}
          </button>
        )}
      </div>
    </div>
  );
};

export default AttendanceList;
