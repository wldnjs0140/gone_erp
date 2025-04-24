import React, { useState, useEffect, useMemo } from "react";
import Header from "./Header";
import "../css/InventoryPage.css";
import ProductList from "./items/view/inventory/ProductList";
import StockList from "./items/view/inventory/StockList";
import AddStockForm from "./items/view/inventory/AddStockForm";
import EditStockForm from "./items/view/inventory/EditStockForm";
import InOutList from "./items/view/inventory/InOutList";
import PaymentPopup from "./items/view/inventory/PaymentPopup";
import ProductTabs from "./items/view/inventory/ProductTabs";

function InventoryPage() {
  const [activeTab, setActiveTab] = useState("p_List");
  const [errorMessage, setErrorMessage] = useState("");

  // 제품 관련 상태
  const [p_List, setP_List] = useState([]);
  const [p_ListPage, setP_ListPage] = useState(1);
  const [p_TotalPages, setP_TotalPages] = useState(1);
  const [p_KeyWord, setP_KeyWord] = useState("");
  const [p_KeyField, setP_KeyField] = useState("");
  const [popupData, setPopupData] = useState(null);
  const [p_quantity, setP_Quantity] = useState(1);
  const [p_SortConfig, setP_SortConfig] = useState({
    key: null,
    direction: "asc",
  });

  // 재고 관련 상태
  const [s_List, setS_List] = useState([]);
  const [s_ListPage, setS_ListPage] = useState(1);
  const [s_TotalPages, setS_TotalPages] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [editData, setEditData] = useState(null);

  // 입출고 관련 상태
  const [io_List, setIo_List] = useState([]);
  const [io_ListPage, setIo_ListPage] = useState(1);
  const [io_TotalPages, setIo_TotalPages] = useState(1);
  const [io_SortConfig, setIo_SortConfig] = useState({
    key: null,
    direction: "asc",
  }); // InOutList 정렬 상태

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 초기 데이터 가져오기
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [productsRes, stocksRes, ioRes] = await Promise.all([
          fetch("http://localhost:84/api/products").then((res) => res.json()),
          fetch("http://localhost:84/api/product-stock").then((res) =>
            res.json()
          ),
          fetch("http://localhost:84/api/stock-history").then((res) =>
            res.json()
          ),
        ]);

        setP_List(productsRes);
        setS_List(stocksRes);
        setIo_List(ioRes);
      } catch (error) {
        console.error("데이터 가져오기 실패:", error);
      }
    };

    fetchInitialData();
  }, [refreshTrigger]);

  // activeTab 변경 시 refreshTrigger 초기화
  useEffect(() => {
    setSelectedItems([]);
    setP_SortConfig({ key: null, direction: "asc" }); // 탭 변경 시 정렬 초기화
    setIo_SortConfig({ key: null, direction: "asc" });
  }, [activeTab]);

  // ProductList 검색 및 정렬
  const filteredPs = useMemo(() => {
    let result = p_KeyField
      ? p_List.filter((item) =>
          item[p_KeyField]?.toLowerCase().includes(p_KeyWord.toLowerCase())
        )
      : p_List;

    if (p_SortConfig.key) {
      result = [...result].sort((a, b) => {
        let valueA = a[p_SortConfig.key];
        let valueB = b[p_SortConfig.key];

        // DESCRIPTION 정렬 처리
        if (p_SortConfig.key === "DESCRIPTION") {
          valueA = valueA ? Number(valueA) : 0; // DESCRIPTION이 없으면 0으로 처리
          valueB = valueB ? Number(valueB) : 0;
        }
        // 숫자 필드 처리
        else if (
          p_SortConfig.key === "DISCOUNTED_PRICE" ||
          p_SortConfig.key === "GOODQUANTITY"
        ) {
          valueA = Number(valueA);
          valueB = Number(valueB);
        }
        // 날짜 필드 처리
        else if (p_SortConfig.key === "REGDATE") {
          valueA = new Date(valueA);
          valueB = new Date(valueB);
        }
        // 문자열 필드 처리
        else {
          valueA = valueA?.toLowerCase() || "";
          valueB = valueB?.toLowerCase() || "";
        }

        if (valueA < valueB) return p_SortConfig.direction === "asc" ? -1 : 1;
        if (valueA > valueB) return p_SortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [p_List, p_KeyField, p_KeyWord, p_SortConfig]);

  // InOutList 정렬
  const sortedIoList = useMemo(() => {
    let result = [...io_List];

    if (io_SortConfig.key) {
      result.sort((a, b) => {
        let valueA = a[io_SortConfig.key];
        let valueB = b[io_SortConfig.key];

        if (
          io_SortConfig.key === "TRANSACTIONID" ||
          io_SortConfig.key === "QUANTITY"
        ) {
          valueA = Number(valueA);
          valueB = Number(valueB);
        } else if (io_SortConfig.key === "TRANSACTIONDATE") {
          valueA = new Date(valueA);
          valueB = new Date(valueB);
        } else {
          valueA = valueA?.toLowerCase() || "";
          valueB = valueB?.toLowerCase() || "";
        }

        if (valueA < valueB) return io_SortConfig.direction === "asc" ? -1 : 1;
        if (valueA > valueB) return io_SortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [io_List, io_SortConfig]);

  // ProductList 페이징 갱신
  useEffect(() => {
    setP_TotalPages(Math.ceil(filteredPs.length / 15));
    setP_ListPage(1);
  }, [filteredPs]);

  // InOutList 페이징 갱신
  useEffect(() => {
    setIo_TotalPages(Math.ceil(sortedIoList.length / 15));
    setIo_ListPage(1);
  }, [sortedIoList]);

  // 핸들러 함수들
  const handleItemSelection = (PRODUCTID) => {
    setSelectedItems((prev) =>
      prev.includes(PRODUCTID)
        ? prev.filter((code) => code !== PRODUCTID)
        : [...prev, PRODUCTID]
    );
  };

  const handleP_Page = (page) => setP_ListPage(page);
  const handleIo_Page = (page) => setIo_ListPage(page);

  const handleP_SearchSubmit = () => {
    if (!p_KeyField) {
      alert("검색할 항목을 선택하세요.");
      return;
    }
    setP_ListPage(1);
  };

  const handleP_Sort = (key) => {
    setP_SortConfig((prevConfig) => {
      if (prevConfig.key === key) {
        return {
          key,
          direction: prevConfig.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
    setP_ListPage(1);
  };

  const handleIo_Sort = (key) => {
    setIo_SortConfig((prevConfig) => {
      if (prevConfig.key === key) {
        return {
          key,
          direction: prevConfig.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
    setIo_ListPage(1);
  };

  const openPopup = (item) => {
    setPopupData(item);
    setP_Quantity(1);
  };

  const closePopup = () => {
    setPopupData(null);
    setErrorMessage("");
  };

  const handleP_QuantityChange = (e) => {
    const newQuantity = e.target.value ? Number(e.target.value) : 0;
    setP_Quantity(newQuantity);
    setErrorMessage(
      newQuantity > popupData?.QUANTITY ? "최대 수량을 초과할 수 없습니다." : ""
    );
  };

  const handlePayment = async (paymentMethod) => {
    const priceToUse =
      popupData.DISCOUNTED_PRICE !== popupData.PRICE
        ? popupData.DISCOUNTED_PRICE
        : popupData.PRICE;

    const paymentData = {
      PRODUCTID: popupData.PRODUCTID,
      PRODUCTCODE: popupData.PRODUCTCODE,
      QUANTITY: p_quantity,
      TOTAL_AMOUNT: priceToUse * p_quantity,
      TRANSACTION_TYPE: "OUT",
      TRANSACTION_DATE: new Date().toISOString(),
      PAYMENT_METHOD: paymentMethod,
    };

    try {
      const response = await fetch("http://localhost:84/api/process-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error("결제 처리 실패");
      }

      const result = await response.json();
      if (result.success) {
        alert(
          `${
            popupData.PRODUCTNAME
          }을(를) ${p_quantity}개 구매하였습니다. 결제 수단: ${paymentMethod}, 총 금액: ${(
            p_quantity * priceToUse
          ).toLocaleString()} 원`
        );
        setRefreshTrigger((prev) => prev + 1);
        closePopup();
      } else {
        alert(result.message || "결제 실패");
      }
    } catch (error) {
      alert("결제 중 오류가 발생했습니다: " + error.message);
    }
  };

  const handleAddProduct = () => setActiveTab("addStock");

  const handleEditProduct = () => {
    if (selectedItems.length !== 1) {
      alert(
        selectedItems.length === 0
          ? "수정할 데이터를 선택하세요!"
          : "하나의 제품만 선택해야 합니다."
      );
      return;
    }
    const productToEdit = s_List.find(
      (item) => item.PRODUCTID === selectedItems[0]
    );
    setEditData(productToEdit);
    setActiveTab("editStock");
  };

  const closeAddTab = () => setActiveTab("stock");

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newProduct = Object.fromEntries(new FormData(e.target).entries());
    setS_List((prev) => [...prev, newProduct]);
    closeAddTab();
  };

  return (
    <div className="inventory-page">
      <Header />
      {/* <h1>재고관리</h1> */}

      <ProductTabs
        setRefreshTrigger={setRefreshTrigger}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      {activeTab === "p_List" && (
        <ProductList
          p_KeyField={p_KeyField}
          p_KeyWord={p_KeyWord}
          handleP_SearchChange={(e) => setP_KeyWord(e.target.value)}
          handleP_KeyFieldChange={(e) => setP_KeyField(e.target.value)}
          handleP_SearchSubmit={handleP_SearchSubmit}
          filteredPs={filteredPs}
          handleP_Page={handleP_Page}
          p_ListPage={p_ListPage}
          p_TotalPages={p_TotalPages}
          openPopup={openPopup}
          sortConfig={p_SortConfig}
          handleSort={handleP_Sort}
        />
      )}
      {activeTab === "stock" && (
        <StockList
          setRefreshTrigger={setRefreshTrigger}
          s_List={s_List}
          s_ListPage={s_ListPage}
          s_TotalPages={s_TotalPages}
          setS_List={setS_List}
          setS_ListPage={setS_ListPage}
          setS_TotalPages={setS_TotalPages}
          handleAddProduct={handleAddProduct}
          handleEditProduct={handleEditProduct}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          handleItemSelection={handleItemSelection}
          activeTab={activeTab}
        />
      )}
      {activeTab === "addStock" && (
        <AddStockForm
          setRefreshTrigger={setRefreshTrigger}
          handleAddSubmit={handleAddSubmit}
          closeAddTab={closeAddTab}
        />
      )}
      {activeTab === "editStock" && (
        <EditStockForm
          setRefreshTrigger={setRefreshTrigger}
          editData={editData}
          setEditData={setEditData}
          setActiveTab={setActiveTab}
        />
      )}
      {activeTab === "in-out" && (
        <InOutList
          io_List={sortedIoList}
          io_ListPage={io_ListPage}
          io_TotalPages={io_TotalPages}
          handleIo_Page={handleIo_Page}
          sortConfig={io_SortConfig}
          handleSort={handleIo_Sort}
        />
      )}
      {activeTab === "p_List" && popupData && (
        <div className="popup-overlay">
          <PaymentPopup
            activeTab={activeTab}
            popupData={popupData}
            p_quantity={p_quantity}
            setP_Quantity={setP_Quantity}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            handleP_QuantityChange={handleP_QuantityChange}
            handlePayment={handlePayment}
            closePopup={closePopup}
          />
        </div>
      )}
    </div>
  );
}

export default InventoryPage;
