import React, { useState, useEffect } from "react";
import "../css/SalesPage.css";
import "../css/Paging.css";
import Header from "./Header";
import SalesTabs from "./items/view/Sales/SalesTabs";
import SalesList from "./items/view/Sales/SalesList";
import PaymentList from "./items/view/Sales/PaymentList";

const SalesPage = () => {
  const [activeTab, setActiveTab] = useState("salesList");
  const [salesList, setSalesList] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // SalesList 데이터 가져오기
  const fetchSalesList = async () => {
    try {
      const salesResponse = await fetch("http://localhost:84/api/sales", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!salesResponse.ok)
        throw new Error("매출 기록을 가져오는 데 실패했습니다.");
      const salesData = await salesResponse.json();
      setSalesList(salesData);
    } catch (err) {
      setError(err.message);
      console.error("매출 데이터 로드 오류:", err);
    }
  };

  // PaymentList 데이터 가져오기
  const fetchPayments = async () => {
    try {
      const paymentResponse = await fetch(
        "http://localhost:84/api/payment-list",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (!paymentResponse.ok)
        throw new Error("결제 내역을 가져오는 데 실패했습니다.");
      const paymentData = await paymentResponse.json();

      const validPayments = Array.isArray(paymentData)
        ? paymentData.filter(
            (p) =>
              p &&
              typeof p === "object" &&
              p !== null &&
              (p.ID || p.PAYMENT_ID) &&
              p.PRODUCTCODE !== null &&
              p.PRODUCTCODE !== undefined
          )
        : [];
      const normalizedPayments = validPayments.map((p) => ({
        id: p.ID || p.PAYMENT_ID || "N/A",
        productCode: p.PRODUCTCODE || "N/A",
        paymentAmount: p.PAYMENTAMOUNT || 0,
        paymentDate: p.PAYMENTDATE || "",
        paymentMethod: p.PAYMENTMETHOD || "N/A",
        quantitySold: parseInt(p.QUANTITYSOLD, 10) || 0,
      }));
      setPayments(normalizedPayments);
    } catch (err) {
      setError(err.message);
      console.error("결제 데이터 로드 오류:", err);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchSalesList(), fetchPayments()]);
      } catch (err) {
        setError(err.message);
        console.error("초기 데이터 로드 오류:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []); // 빈 의존성 배열로 마운트 시 한 번만 실행

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error}</div>;

  return (
    <div className="sales-screen">
      <Header />
      <div className="content">
        <SalesTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === "salesList" && (
          <div>
            <SalesList salesList={salesList} setSalesList={setSalesList} />
          </div>
        )}
        {activeTab === "paymentList" && (
          <div>
            <PaymentList
              payments={payments}
              setPayments={setPayments}
              fetchSalesList={fetchSalesList}
              fetchPayments={fetchPayments} // fetchPayments를 props로 전달
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesPage;
