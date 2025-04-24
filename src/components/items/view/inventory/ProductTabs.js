// ProductTabs.js
import React from "react";

function ProductTabs({ activeTab, setActiveTab }) {
  return (
    <>
      {/* 기본 탭 표시 */}
      {activeTab !== "addStock" && activeTab !== "editStock" && (
        <div className="tabs">
          <button
            className={activeTab === "p_List" ? "active" : ""}
            onClick={() => setActiveTab("p_List")}
          >
            제품 리스트
          </button>
          <button
            className={activeTab === "stock" ? "active" : ""}
            onClick={() => setActiveTab("stock")}
          >
            재고리스트
          </button>
          <button
            className={activeTab === "in-out" ? "active" : ""}
            onClick={() => setActiveTab("in-out")}
          >
            입출고 정보
          </button>
        </div>
      )}
      {/* 재고 추가 중 탭버튼 표시*/}
      {activeTab === "addStock" && (
        <div className="tabs">
          <button
            className={activeTab === "p_List" ? "active" : ""}
            onClick={() => setActiveTab("p_List")}
          >
            제품 리스트
          </button>
          <button
            className={activeTab === "addStock" ? "active" : ""}
            onClick={() => setActiveTab("stock")}
          >
            재고리스트
          </button>
          <button
            className={activeTab === "in-out" ? "active" : ""}
            onClick={() => setActiveTab("in-out")}
          >
            입출고 정보
          </button>
        </div>
      )}
      {/* 재고 수정 중 탭 표시 */}
      {activeTab === "editStock" && (
        <div className="tabs">
          <button
            className={activeTab === "p_List" ? "active" : ""}
            onClick={() => setActiveTab("p_List")}
          >
            제품 리스트
          </button>
          <button
            className={activeTab === "editStock" ? "active" : ""}
            onClick={() => setActiveTab("stock")}
          >
            재고리스트
          </button>
          <button
            className={activeTab === "in-out" ? "active" : ""}
            onClick={() => setActiveTab("in-out")}
          >
            입출고 정보
          </button>
        </div>
      )}
    </>
  );
}

export default ProductTabs;
