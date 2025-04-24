// ProductTabs.js
import React from "react";

function SalesTabs({ activeTab, setActiveTab }) {
  return (
    <>
      {/* 탭 버튼 */}

      <div className="tabs">
        <button
          className={activeTab === "salesList" ? "active" : ""}
          onClick={() => setActiveTab("salesList")}
        >
          매출기록
        </button>
        <button
          className={activeTab === "paymentList" ? "active" : ""}
          onClick={() => setActiveTab("paymentList")}
        >
          결제내역
        </button>
      </div>
    </>
  );
}

export default SalesTabs;
