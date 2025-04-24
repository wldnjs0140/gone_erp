import React, { useState, useEffect } from "react";
import Header from "./Header";
import "../css/HRPage.css";
import HrTabs from "./items/view/Hr/HrTabs";
import EmployeeList from "./items/view/Hr/EmployeeList";
import AttendanceList from "./items/view/Hr/AttendanceList";
import SalaryList from "./items/view/Hr/SalaryList";
import AddAttendanceModal from "./items/view/Hr/AddAttendanceModal";

function HRPage() {
  const [activeTab, setActiveTab] = useState("employee");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [employees, setEmployees] = useState([]);
  const [employeePage, setEmployeePage] = useState(1);
  const [employeeTotalPages, setEmployeeTotalPages] = useState(1);
  const [employeeKeyWord, setEmployeeKeyWord] = useState("");
  const [employeeKeyField, setEmployeeKeyField] = useState("");
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [allPositionsSelected, setAllPositionsSelected] = useState(false);
  const [selectedEmploymentStatuses, setSelectedEmploymentStatuses] = useState(
    []
  );
  const [allEmploymentStatusesSelected, setAllEmploymentStatusesSelected] =
    useState(false);

  const [attendances, setAttendances] = useState([]);
  const [attendancePage, setAttendancePage] = useState(1);
  const [, setAttendanceTotalPages] = useState(1);

  const [allSalaries, setAllSalaries] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [salaryPage, setSalaryPage] = useState(1);
  const [salaryTotalPages, setSalaryTotalPages] = useState(1);
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);

  const [showAddAttendanceModal, setShowAddAttendanceModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  const positions = ["주임", "사원", "대리", "과장", "차장", "부장"];
  const employmentStatuses = [
    { value: "A", label: "재직" },
    { value: "L", label: "휴직" },
    { value: "R", label: "퇴직" },
  ];

  const ITEMS_PER_PAGE = 15;

  const normalizePaymentDate = (paymentDate) => {
    if (paymentDate.includes("-")) {
      const [year, month, day] = paymentDate.split("-");
      return `${year.slice(2)}/${month}/${day}`;
    }
    return paymentDate;
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [employeesRes, attendancesRes, salariesRes] = await Promise.all([
          fetch(`http://localhost:84/api/hr/employees`).then((res) =>
            res.json()
          ),
          fetch("http://localhost:84/api/hr/attendances").then((res) =>
            res.json()
          ),
          fetch(`http://localhost:84/api/hr/salaries`).then((res) =>
            res.json()
          ),
        ]);

        if (employeesRes.success) {
          setEmployees(employeesRes.data);
        }

        if (attendancesRes.success) {
          setAttendances(attendancesRes.data);
          setAttendanceTotalPages(
            Math.ceil(attendancesRes.data.length / ITEMS_PER_PAGE)
          );
        }

        if (salariesRes.success) {
          const normalizedSalaries = salariesRes.data.map((salary) => ({
            ...salary,
            paymentDate: normalizePaymentDate(salary.paymentDate),
          }));
          setAllSalaries(normalizedSalaries);
          setSalaries(normalizedSalaries);
          setSalaryTotalPages(
            Math.ceil(normalizedSalaries.length / ITEMS_PER_PAGE)
          );

          const years = [
            ...new Set(
              normalizedSalaries.map(
                (salary) => `20${salary.paymentDate.split("/")[0]}`
              )
            ),
          ].sort();
          setAvailableYears(years);

          if (normalizedSalaries.length > 0 && !yearFilter && !monthFilter) {
            const latestYear = years[years.length - 1];
            setYearFilter(latestYear);

            const months = [
              ...new Set(
                normalizedSalaries
                  .filter((salary) =>
                    salary.paymentDate.startsWith(latestYear.slice(2))
                  )
                  .map((salary) => salary.paymentDate.split("/")[1])
              ),
            ].sort();
            setAvailableMonths(months);
            setMonthFilter(months[months.length - 1] || "");
          }
        }
      } catch (error) {
        console.error("데이터 가져오기 실패:", error);
      }
    };

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  useEffect(() => {
    if (yearFilter) {
      const selectedYear = yearFilter.slice(2);
      const months = [
        ...new Set(
          allSalaries
            .filter((salary) => salary.paymentDate.startsWith(selectedYear))
            .map((salary) => salary.paymentDate.split("/")[1])
        ),
      ].sort();
      setAvailableMonths(months);
    } else {
      setAvailableMonths([]);
    }
  }, [yearFilter, allSalaries]);

  useEffect(() => {
    let filteredSalaries = [...allSalaries];

    if (yearFilter) {
      const selectedYear = yearFilter.slice(2);
      filteredSalaries = filteredSalaries.filter((salary) =>
        salary.paymentDate.startsWith(selectedYear)
      );
    }

    if (monthFilter) {
      filteredSalaries = filteredSalaries.filter((salary) =>
        salary.paymentDate.includes(`/${monthFilter}/`)
      );
    }

    setSalaries(filteredSalaries);
    setSalaryTotalPages(Math.ceil(filteredSalaries.length / ITEMS_PER_PAGE));
    setSalaryPage(1);
  }, [yearFilter, monthFilter, allSalaries]);

  const filteredEmployees = employees.filter((item) => {
    const matchesSearch =
      employeeKeyField && employeeKeyWord
        ? item[employeeKeyField]
            ?.toLowerCase()
            .includes(employeeKeyWord.toLowerCase())
        : true;
    const matchesPosition =
      selectedPositions.length > 0
        ? selectedPositions.includes(item.position)
        : true;
    const matchesEmploymentStatus =
      selectedEmploymentStatuses.length > 0
        ? selectedEmploymentStatuses.includes(item.employmentStatus)
        : true;
    return matchesSearch && matchesPosition && matchesEmploymentStatus;
  });

  useEffect(() => {
    const newTotalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
    setEmployeeTotalPages(newTotalPages);

    if (employeePage > newTotalPages && newTotalPages > 0) {
      setEmployeePage(newTotalPages);
    }
    if (newTotalPages === 0) {
      setEmployeePage(1);
    }
  }, [filteredEmployees, employeePage]);

  const handlePositionCheckboxChange = (position) => {
    setSelectedPositions((prev) =>
      prev.includes(position)
        ? prev.filter((p) => p !== position)
        : [...prev, position]
    );
    setAllPositionsSelected(false);
    setEmployeePage(1);
  };

  const handleAllPositionsCheckboxChange = () => {
    setSelectedPositions(allPositionsSelected ? [] : [...positions]);
    setAllPositionsSelected(!allPositionsSelected);
    setEmployeePage(1);
  };

  const handleEmploymentStatusCheckboxChange = (status) => {
    setSelectedEmploymentStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
    setAllEmploymentStatusesSelected(false);
    setEmployeePage(1);
  };

  const handleAllEmploymentStatusesCheckboxChange = () => {
    setSelectedEmploymentStatuses(
      allEmploymentStatusesSelected
        ? []
        : employmentStatuses.map((status) => status.value)
    );
    setAllEmploymentStatusesSelected(!allEmploymentStatusesSelected);
    setEmployeePage(1);
  };

  const handleEmployeePage = (page) => setEmployeePage(page);
  const handleAttendancePage = (page) => setAttendancePage(page);
  const handleSalaryPage = (page) => setSalaryPage(page);

  const handleEmployeeSearchSubmit = () => {
    if (!employeeKeyField) {
      alert("검색할 항목을 선택하세요.");
      return;
    }
    setEmployeePage(1);
  };

  const handleEmployeeSort = (option) => {
    const sortedEmployees = [...employees].sort((a, b) => {
      if (option === "default") return a.employeeId.localeCompare(b.employeeId);
      if (option === "nameAsc") return a.name.localeCompare(b.name);
      if (option === "nameDesc") return b.name.localeCompare(a.name);
      if (option === "reg0614Asc")
        return new Date(a.regDate) - new Date(b.regDate);
      if (option === "regDateDesc")
        return new Date(b.regDate) - new Date(a.regDate);
      return 0;
    });
    setEmployees(sortedEmployees);
    setEmployeePage(1);
  };

  const handleAttendanceSort = (option) => {
    const sortedAttendances = [...attendances].sort((a, b) => {
      if (option === "default") return a.employeeId.localeCompare(b.employeeId);
      if (option === "dateAsc")
        return new Date(a.attendanceDate) - new Date(b.attendanceDate);
      if (option === "dateDesc")
        return new Date(b.attendanceDate) - new Date(a.attendanceDate);
      return 0;
    });
    setAttendances(sortedAttendances);
    setAttendancePage(1);
  };

  const openAddAttendanceModal = (type, attendance = null) => {
    setSelectedAttendance(attendance);
    setShowAddAttendanceModal(true);
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="hr-page">
      <Header />
      {/* <h1>인사관리</h1> */}

      <HrTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "employee" && (
        <EmployeeList
          employeeKeyField={employeeKeyField}
          employeeKeyWord={employeeKeyWord}
          handleEmployeeSearchChange={(e) => setEmployeeKeyWord(e.target.value)}
          handleEmployeeKeyFieldChange={(e) =>
            setEmployeeKeyField(e.target.value)
          }
          handleEmployeeSearchSubmit={handleEmployeeSearchSubmit}
          selectedPositions={selectedPositions}
          handlePositionCheckboxChange={handlePositionCheckboxChange}
          allPositionsSelected={allPositionsSelected}
          handleAllPositionsCheckboxChange={handleAllPositionsCheckboxChange}
          positions={positions}
          selectedEmploymentStatuses={selectedEmploymentStatuses}
          handleEmploymentStatusCheckboxChange={
            handleEmploymentStatusCheckboxChange
          }
          allEmploymentStatusesSelected={allEmploymentStatusesSelected}
          handleAllEmploymentStatusesCheckboxChange={
            handleAllEmploymentStatusesCheckboxChange
          }
          employmentStatuses={employmentStatuses}
          filteredEmployees={filteredEmployees}
          handleEmployeeSort={handleEmployeeSort}
          handleEmployeePage={handleEmployeePage}
          employeePage={employeePage}
          employeeTotalPages={employeeTotalPages}
          onEmployeeUpdate={handleRefresh}
        />
      )}
      {activeTab === "attendance" && (
        <AttendanceList
          attendances={attendances}
          attendancePage={attendancePage}
          handleAttendanceSort={handleAttendanceSort}
          handleAttendancePage={handleAttendancePage}
          openAddAttendanceModal={openAddAttendanceModal}
        />
      )}
      {activeTab === "salary" && (
        <SalaryList
          salaries={salaries}
          salaryPage={salaryPage}
          salaryTotalPages={salaryTotalPages}
          handleSalaryPage={handleSalaryPage}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
          monthFilter={monthFilter}
          setMonthFilter={setMonthFilter}
          availableYears={availableYears}
          availableMonths={availableMonths}
          setRefreshTrigger={setRefreshTrigger} // setRefreshTrigger 전달
        />
      )}

      {showAddAttendanceModal && (
        <div className="popup-overlay">
          <AddAttendanceModal
            closeModal={() => {
              setShowAddAttendanceModal(false);
              setSelectedAttendance(null);
              setRefreshTrigger((prev) => prev + 1);
            }}
            initialData={selectedAttendance}
            isEditMode={!!selectedAttendance}
          />
        </div>
      )}
    </div>
  );
}

export default HRPage;
