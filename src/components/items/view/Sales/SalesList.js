import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const SalesList = ({ salesList, setSalesList }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [displayedSales, setDisplayedSales] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filterType, setFilterType] = useState("all");
  const [showPopup, setShowPopup] = useState(false);
  const [monthlySales, setMonthlySales] = useState([]);
  const [error, setError] = useState(null); // 에러 상태 추가

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowPopup(false); // 모달 바깥 클릭 시 닫기
    }
  };
  // salesList 또는 currentPage, filterType 변경 시 displayedSales 동기화
  useEffect(() => {
    let filteredSales;

    if (filterType === "profit") {
      filteredSales = salesList.filter((record) => calculateProfit(record) > 0);
    } else if (filterType === "loss") {
      filteredSales = salesList.filter((record) => calculateProfit(record) < 0);
    } else {
      filteredSales = salesList;
    }

    const startIndex = (currentPage - 1) * 15;
    const endIndex = startIndex + 15;
    setDisplayedSales(filteredSales.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(filteredSales.length / 15));
  }, [salesList, currentPage, filterType]);

  // 손익 계산
  const calculateProfit = (record) => {
    if (record.PAYMENTTYPE === "환불") {
      return -record.COST;
    } else if (record.PAYMENTTYPE === "카드") {
      return record.TOTALAMOUNT - record.TOTALAMOUNT * 0.1 - record.COST;
    } else {
      return record.TOTALAMOUNT - record.COST;
    }
  };

  // 총 손익 계산
  const calculateTotalProfit = () => {
    return salesList.reduce(
      (total, record) => total + calculateProfit(record),
      0
    );
  };

  // 정렬 기능
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sortedData = [...salesList].sort((a, b) => {
      if (key === "SALESDATE") {
        return direction === "asc"
          ? new Date(a[key]) - new Date(b[key])
          : new Date(b[key]) - new Date(a[key]);
      }
      if (key === "profit") {
        return direction === "asc"
          ? calculateProfit(a) - calculateProfit(b)
          : calculateProfit(b) - calculateProfit(a);
      }
      if (key === "PRODUCTCODE") {
        const numA = parseInt(a[key].replace(/\D/g, "")) || 0;
        const numB = parseInt(b[key].replace(/\D/g, "")) || 0;
        return direction === "asc" ? numA - numB : numB - numA;
      }
      return direction === "asc"
        ? a[key] > b[key]
          ? 1
          : -1
        : a[key] < b[key]
        ? 1
        : -1;
    });

    setSalesList(sortedData);
    setSortConfig({ key, direction });
  };

  // 페이지 변경
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 페이지네이션 범위 계산
  const pageNumbers = () => {
    const range = [];
    const maxPage = Math.min(5, totalPages);
    let start = Math.max(1, currentPage - 2);
    let end = start + maxPage - 1;

    if (end > totalPages) {
      start = totalPages - maxPage + 1;
      end = totalPages;
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  };

  const toggleFilter = (type) => {
    setFilterType((prevFilter) => (prevFilter === type ? "all" : type));
    setCurrentPage(1);
  };

  const fetchMonthlySales = async () => {
    try {
      const response = await fetch("http://localhost:84/api/monthly-sales", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok)
        throw new Error("월별 매출 데이터를 가져오는 데 실패했습니다.");
      const data = await response.json();

      // 데이터가 배열인지 확인
      if (!Array.isArray(data)) {
        throw new Error("월별 매출 데이터가 배열 형식이 아닙니다.");
      }

      // 필수 필드(SALE_MONTH, TOTAL_SALES)가 있는지 확인
      const validatedData = data.map((item) => ({
        SALE_MONTH: item.SALE_MONTH || "Unknown",
        TOTAL_SALES: item.TOTAL_SALES || 0, // 서버에서 TOTAL_SALES로 반환된다고 가정
      }));

      setMonthlySales(validatedData);
      setShowPopup(true);
      setError(null); // 성공 시 에러 초기화
    } catch (error) {
      setError(error.message);
      console.error("월별 매출 데이터 가져오기 오류:", error);
      setShowPopup(false); // 에러 발생 시 팝업 닫기
    }
  };

  // 차트 데이터 설정
  const chartData = {
    labels: monthlySales.map((item) => `${item.SALE_MONTH}월`),
    datasets: [
      {
        label: "월별 매출",
        data: monthlySales.map((item) => item.TOTAL_SALES),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // 차트 옵션 (선택적)
  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "매출액 (원)",
        },
      },
      x: {
        title: {
          display: true,
          text: "월",
        },
      },
    },
  };

  return (
    <div className="salesList">
      <div className="filters">
        <label>
          <input
            type="checkbox"
            checked={filterType === "profit"}
            onChange={() => toggleFilter("profit")}
          />
          이익금만
        </label>
        <label>
          <input
            type="checkbox"
            checked={filterType === "loss"}
            onChange={() => toggleFilter("loss")}
          />
          손해금만
        </label>
        <button onClick={fetchMonthlySales}>월별 매출 내역</button>
      </div>

      {/* 에러 메시지 표시 */}
      {error && <div className="error-message">오류: {error}</div>}

      {/* 팝업 창 */}
      {showPopup && monthlySales.length > 0 && (
        <div className="popup" onClick={handleOverlayClick}>
          <div className="popup-content">
            <button className="close-btn" onClick={() => setShowPopup(false)}>
              X
            </button>
            <h2>월별 매출 그래프</h2>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      <table className="sales-table">
        <thead>
          <tr>
            <th
              onClick={() => handleSort("SALESID")}
              className="sortable-header"
            >
              번호
            </th>
            <th>제품코드</th>
            <th
              onClick={() => handleSort("QUANTITYSOLD")}
              className="sortable-header"
            >
              판매수량
            </th>
            <th
              onClick={() => handleSort("TOTALAMOUNT")}
              className="sortable-header"
            >
              총판매금액
            </th>
            <th
              onClick={() => handleSort("profit")}
              className="sortable-header"
            >
              손익금액(원)
            </th>
            <th
              onClick={() => handleSort("SALESDATE")}
              className="sortable-header"
            >
              등록일
            </th>
            <th>결제구분</th>
          </tr>
        </thead>
        <tbody>
          {displayedSales.map((record) => (
            <tr key={record.SALESID}>
              <td>{record.SALESID}</td>
              <td>{record.PRODUCTCODE}</td>
              <td>{record.QUANTITYSOLD}</td>
              <td>{record.TOTALAMOUNT.toLocaleString()}</td>
              <td className={calculateProfit(record) < 0 ? "loss" : "profit"}>
                {Math.floor(calculateProfit(record)).toLocaleString()}
              </td>
              <td>{new Date(record.SALESDATE).toLocaleDateString()}</td>
              <td>{record.PAYMENTTYPE}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="summary">
        <span>
          총 손익금액: {Math.floor(calculateTotalProfit()).toLocaleString()} 원
        </span>
      </div>

      {/* 페이지네이션 */}
      <div className="pagination">
        {currentPage > 1 && (
          <button
            onClick={() => handlePageChange(1)}
            className="arrow first-page"
          >
            {"<<"}
          </button>
        )}
        {currentPage > 1 && (
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className="arrow left-arrow"
          >
            {"<"}
          </button>
        )}
        {pageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={currentPage === page ? "active" : ""}
          >
            {page}
          </button>
        ))}
        {currentPage < totalPages && (
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="arrow right-arrow"
          >
            {">"}
          </button>
        )}
        {currentPage < totalPages && (
          <button
            onClick={() => handlePageChange(totalPages)}
            className="arrow last-page"
          >
            {">>"}
          </button>
        )}
      </div>
    </div>
  );
};

export default SalesList;
