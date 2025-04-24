import React, { useEffect, useState } from "react";
import AddPaymentModal from "./AddPaymentModal";

const PaymentList = ({
  payments,
  setPayments,
  fetchSalesList,
  fetchPayments,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [displayedPayments, setDisplayedPayments] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [editPayment, setEditPayment] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unitPrice, setUnitPrice] = useState(0);

  // 페이지네이션 및 데이터 표시
  useEffect(() => {
    const startIndex = (currentPage - 1) * 15;
    const endIndex = startIndex + 15;
    setDisplayedPayments(payments.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(payments.length / 15));
  }, [payments, currentPage]);

  // 제품 단가 조회
  const fetchUnitPrice = async (productCode) => {
    if (productCode && /^[A-Z0-9]{5,10}$/.test(productCode)) {
      try {
        const response = await fetch(
          `http://localhost:84/api/product-info?code=${productCode}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error("제품 정보를 가져오지 못했습니다.");
        const data = await response.json();
        if (data.success) {
          setUnitPrice(data.data.unitPrice || 0);
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        setError(error.message);
        setUnitPrice(0);
      }
    }
  };

  // 판매 수량 변경 시 결제 금액 업데이트
  useEffect(() => {
    if (editPayment && editPayment.quantitySold && unitPrice) {
      const quantity = parseInt(editPayment.quantitySold);
      if (!isNaN(quantity) && quantity > 0) {
        const calculatedAmount = unitPrice * quantity;
        setEditPayment((prev) => ({
          ...prev,
          paymentAmount: calculatedAmount.toString(),
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editPayment?.quantitySold, unitPrice]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sortedData = [...payments].sort((a, b) => {
      if (!a || !b) return 0;
      const valueA = a[key] !== null && a[key] !== undefined ? a[key] : "";
      const valueB = b[key] !== null && b[key] !== undefined ? b[key] : "";

      if (key === "paymentDate") {
        return direction === "asc"
          ? new Date(valueA) - new Date(valueB)
          : new Date(valueB) - new Date(valueA);
      }
      return direction === "asc"
        ? valueA > valueB
          ? 1
          : -1
        : valueA < valueB
        ? 1
        : -1;
    });

    setPayments(sortedData);
    setSortConfig({ key, direction });
  };

  const handleAddPayment = async (newPayment) => {
    try {
      const response = await fetch(
        "http://localhost:84/api/add-payment-detail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(newPayment),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "결제 내역 추가 실패");
      }

      const result = await response.json();
      console.log("Add Payment Response:", result);
      await fetchPayments(); // 부모의 fetchPayments 호출
      await fetchSalesList();
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error("결제 내역 추가 오류:", error);
    }
  };

  const handleEditPayment = (payment) => {
    setEditPayment(
      payment || {
        productCode: "",
        paymentAmount: "",
        paymentDate: "",
        paymentMethod: "",
        quantitySold: "",
        id: null,
        useYn: "Y",
      }
    );
    if (payment?.productCode) {
      fetchUnitPrice(payment.productCode);
    }
  };

  const handleCancelEdit = () => {
    setEditPayment(null);
    setUnitPrice(0);
    setError(null);
  };

  const handleSavePayment = async () => {
    if (!editPayment || !editPayment.id) {
      setError("수정할 결제 내역이 유효하지 않습니다.");
      return;
    }

    const errors = {};
    if (
      !editPayment.productCode ||
      !/^[A-Z0-9]{5,10}$/.test(editPayment.productCode)
    ) {
      errors.productCode =
        "제품 코드는 5-10자의 대문자와 숫자로 구성되어야 합니다.";
    }
    const paymentAmount = parseFloat(editPayment.paymentAmount);
    if (
      isNaN(paymentAmount) ||
      paymentAmount <= 0 ||
      paymentAmount > 100_000_000
    ) {
      errors.paymentAmount =
        "결제 금액은 1원에서 100,000,000원 사이여야 합니다.";
    }
    const quantitySold = parseInt(editPayment.quantitySold);
    if (isNaN(quantitySold) || quantitySold <= 0) {
      errors.quantitySold = "판매 수량은 1 이상이어야 합니다.";
    }
    const calculatedAmount = unitPrice * quantitySold;
    if (Math.abs(paymentAmount - calculatedAmount) > 0.01) {
      errors.paymentAmount = `결제 금액은 ${calculatedAmount.toLocaleString()}원(단가 ${unitPrice.toLocaleString()}원 × 수량 ${quantitySold})이어야 합니다.`;
    }
    if (
      !editPayment.paymentDate ||
      !/^\d{4}-\d{2}-\d{2}$/.test(editPayment.paymentDate)
    ) {
      errors.paymentDate = "결제 날짜는 YYYY-MM-DD 형식이어야 합니다.";
    }
    const validPaymentMethods = ["카드", "현금", "계좌이체", "환불"];
    if (
      !editPayment.paymentMethod ||
      !validPaymentMethods.includes(editPayment.paymentMethod)
    ) {
      errors.paymentMethod = "유효하지 않은 결제 방식입니다.";
    }

    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors).join(" "));
      return;
    }

    try {
      const response = await fetch("http://localhost:84/api/update-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          PAYMENT_ID: editPayment.id,
          productCode: editPayment.productCode,
          paymentAmount: editPayment.paymentAmount,
          paymentDate: editPayment.paymentDate,
          paymentMethod: editPayment.paymentMethod,
          quantitySold: editPayment.quantitySold,
          useYn: editPayment.useYn || "Y",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "결제 내역 수정 실패");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "결제 내역 수정 실패");
      }

      await fetchPayments(); // 부모의 fetchPayments 호출
      await fetchSalesList();
      setEditPayment(null);
      setUnitPrice(0);
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error("결제 내역 수정 오류:", error);
    }
  };

  const handleDeletePayment = async (id) => {
    if (!id) {
      setError("삭제할 결제 내역 ID가 유효하지 않습니다.");
      return;
    }

    if (
      window.confirm(
        "정말로 삭제하시겠습니까? 이 작업은 매출 내역에도 영향을 미칩니다."
      )
    ) {
      try {
        const response = await fetch("http://localhost:84/api/delete-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ PAYMENT_ID: id }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "결제 내역 삭제 실패");
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || "결제 내역 삭제 실패");
        }

        await fetchPayments(); // 부모의 fetchPayments 호출
        await fetchSalesList();
        setError(null);
      } catch (error) {
        setError(error.message);
        console.error("결제 내역 삭제 오류:", error);
      }
    }
  };

  if (error) {
    return <div className="error-message">오류: {error}</div>;
  }

  return (
    <div className="paymentList">
      <div className="payment-table-header">
        <button
          className="add-payment-btn"
          onClick={() => setIsModalOpen(true)}
        >
          추가
        </button>
      </div>
      <div className="payment-table">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort("id")} className="sortable-header">
                번호
              </th>
              <th>제품 코드</th>
              <th
                onClick={() => handleSort("paymentAmount")}
                className="sortable-header"
              >
                결제 금액
              </th>
              <th
                onClick={() => handleSort("paymentDate")}
                className="sortable-header"
              >
                결제 날짜
              </th>
              <th
                onClick={() => handleSort("paymentMethod")}
                className="sortable-header"
              >
                결제 방식
              </th>
              <th>판매 수량</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {displayedPayments.map((payment) => (
              <tr key={payment?.id || Math.random()}>
                <td>{payment?.id || "N/A"}</td>
                <td>
                  {editPayment && editPayment.id === payment?.id ? (
                    <input
                      type="text"
                      value={editPayment.productCode || ""}
                      onChange={(e) => {
                        const newProductCode = e.target.value.toUpperCase();
                        setEditPayment({
                          ...editPayment,
                          productCode: newProductCode,
                        });
                        fetchUnitPrice(newProductCode);
                      }}
                    />
                  ) : (
                    payment?.productCode || "N/A"
                  )}
                </td>
                <td>
                  {editPayment && editPayment.id === payment?.id ? (
                    <input
                      type="text"
                      value={editPayment.paymentAmount || ""}
                      readOnly
                    />
                  ) : (
                    payment?.paymentAmount?.toLocaleString() || "N/A"
                  )}
                </td>
                <td>
                  {editPayment && editPayment.id === payment?.id ? (
                    <input
                      type="date"
                      value={editPayment.paymentDate || ""}
                      onChange={(e) =>
                        setEditPayment({
                          ...editPayment,
                          paymentDate: e.target.value,
                        })
                      }
                    />
                  ) : (
                    payment?.paymentDate || "N/A"
                  )}
                </td>
                <td>
                  {editPayment && editPayment.id === payment?.id ? (
                    <select
                      value={editPayment.paymentMethod || ""}
                      onChange={(e) =>
                        setEditPayment({
                          ...editPayment,
                          paymentMethod: e.target.value,
                        })
                      }
                    >
                      <option value="">결제 방식 선택</option>
                      <option value="카드">카드</option>
                      <option value="현금">현금</option>
                      <option value="계좌이체">계좌이체</option>
                      <option value="환불">환불</option>
                    </select>
                  ) : (
                    payment?.paymentMethod || "N/A"
                  )}
                </td>
                <td>
                  {editPayment && editPayment.id === payment?.id ? (
                    <input
                      type="number"
                      value={editPayment.quantitySold || ""}
                      onChange={(e) =>
                        setEditPayment({
                          ...editPayment,
                          quantitySold: e.target.value,
                        })
                      }
                    />
                  ) : (
                    payment?.quantitySold ?? "0"
                  )}
                </td>
                <td>
                  {editPayment && editPayment.id === payment?.id ? (
                    <>
                      <button onClick={handleSavePayment}>저장</button>
                      <button onClick={handleCancelEdit}>취소</button>
                    </>
                  ) : (
                    <button onClick={() => handleEditPayment(payment)}>
                      수정
                    </button>
                  )}
                  <button onClick={() => handleDeletePayment(payment?.id)}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <AddPaymentModal
          onAddPayment={handleAddPayment}
          onClose={() => setIsModalOpen(false)}
        />
      )}
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

export default PaymentList;
