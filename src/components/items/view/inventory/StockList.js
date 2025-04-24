import React, { useEffect, useMemo, useState } from "react";

function StockList({
  setRefreshTrigger,
  s_List,
  s_ListPage,
  s_TotalPages,
  setS_List,
  setS_ListPage,
  setS_TotalPages,
  handleAddProduct,
  handleEditProduct,
  handleItemSelection,
  setSelectedItems,
  selectedItems,
  activeTab,
}) {
  const [displayedSs, setDisplayedSs] = useState([]);
  const [s_KeyWord, setS_KeyWord] = useState("");
  const [s_KeyField, setS_KeyField] = useState("");
  const [s_popupData, setS_PopupData] = useState(null);
  const [s_quantity, setS_Quantity] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDelMode, setIsDelMode] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleS_SearchChange = (e) => {
    setS_KeyWord(e.target.value);
  };

  const handleS_KeyFieldChange = (e) => {
    setS_KeyField(e.target.value);
  };

  // 검색 필터링
  const filteredSs = useMemo(() => {
    return s_KeyField
      ? s_List.filter((item) =>
          item[s_KeyField]?.toLowerCase().includes(s_KeyWord.toLowerCase())
        )
      : s_List;
  }, [s_List, s_KeyField, s_KeyWord]);

  const sortedSs = useMemo(() => {
    return [...filteredSs].sort((a, b) => {
      if (!sortConfig.key) return 0;

      let valueA = a[sortConfig.key];
      let valueB = b[sortConfig.key];

      if (
        sortConfig.key === "COST" ||
        sortConfig.key === "TOTALQUANTITY" ||
        sortConfig.key === "GOODQUANTITY" ||
        sortConfig.key === "DEFECTIVEQUANTITY"
      ) {
        valueA = Number(valueA);
        valueB = Number(valueB);
      } else if (sortConfig.key === "LASTUPDATED") {
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
  }, [filteredSs, sortConfig]);

  // 필터링 및 정렬 후 총 페이지 수 갱신
  useEffect(() => {
    setS_TotalPages(Math.ceil(sortedSs.length / 15));
  }, [sortedSs, setS_TotalPages]);

  // s_ListPage 변경 시 displayedSs 갱신
  useEffect(() => {
    const startIndex = (s_ListPage - 1) * 15;
    setDisplayedSs(sortedSs.slice(startIndex, startIndex + 15));
  }, [s_ListPage, sortedSs]);

  // 검색어 또는 정렬 변경 시 페이지 초기화
  useEffect(() => {
    setS_ListPage(1);
  }, [s_KeyWord, s_KeyField, sortConfig, setS_ListPage]);

  const handleS_QuantityChange = (e) => {
    const newQuantity = e.target.value === "" ? "" : Number(e.target.value);
    setS_Quantity(newQuantity);

    if (newQuantity !== "" && newQuantity > s_popupData?.TOTALQUANTITY) {
      setErrorMessage(
        `총수량(${s_popupData.TOTALQUANTITY}개) 이하로 입력하세요.`
      );
    } else if (
      newQuantity !== "" &&
      newQuantity < -s_popupData?.DEFECTIVEQUANTITY
    ) {
      setErrorMessage("불량수량보다 작은 값은 입력할 수 없습니다.");
    } else if (
      newQuantity !== "" &&
      s_popupData?.GOODQUANTITY - newQuantity < 0
    ) {
      setErrorMessage("양품 수량은 0 미만으로 설정할 수 없습니다.");
    } else {
      setErrorMessage("");
    }
  };

  const openS_Popup = (product) => {
    setS_PopupData(product);
    setS_Quantity(1);
  };

  const closeS_Popup = () => {
    setS_PopupData(null);
    setErrorMessage("");
  };

  // const handleOverlayClick = (e) => {
  //   if (e.target === e.currentTarget) {
  //     closeS_Popup();
  //   }
  // };

  const handleDefecStock = async () => {
    if (s_quantity === 0) {
      setErrorMessage("수량을 0으로 설정할 수 없습니다.");
      return;
    }

    const updateData = {
      PRODUCTCODE: s_popupData.PRODUCTCODE,
      DEFECTIVEQUANTITY: s_quantity,
    };

    try {
      const response = await fetch(
        "http://localhost:84/api/update-defective-stock",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error("서버와의 통신에 실패했습니다.");
      }

      const result = await response.json();

      if (result.success) {
        alert("불량 수량이 업데이트되었습니다.");
        setS_List((prevList) =>
          prevList.map((item) =>
            item.PRODUCTCODE === s_popupData.PRODUCTCODE
              ? {
                  ...item,
                  DEFECTIVEQUANTITY: item.DEFECTIVEQUANTITY + s_quantity,
                  GOODQUANTITY: item.GOODQUANTITY - s_quantity,
                  TOTALQUANTITY: item.TOTALQUANTITY,
                }
              : item
          )
        );
        closeS_Popup();
        setRefreshTrigger((prev) => prev + 1);
      } else {
        alert(result.message || "업데이트 실패");
      }
    } catch (error) {
      alert(error.message || "오류 발생");
      console.log(displayedSs);
    }
  };

  const handleDeleteSelectedItems = () => {
    const confirmDelete = window.confirm("선택한 항목을 삭제하시겠습니까?");
    if (confirmDelete) {
      fetch("http://localhost:84/api/delete-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedItems),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("선택한 항목이 삭제되었습니다.");
            setS_List((prevS_List) =>
              prevS_List.filter(
                (item) => !selectedItems.includes(item.PRODUCTCODE)
              )
            );
            setRefreshTrigger((prev) => prev + 1);
            setSelectedItems([]);
          } else {
            alert(data.message || "삭제 실패");
          }
        })
        .catch((error) => {
          console.error(error);
          alert("삭제 요청에 실패했습니다.");
        });
    }
  };

  const handleS_Page = (page) => {
    setS_ListPage(page);
  };

  const handleS_SearchSubmit = () => {
    if (!s_KeyField) {
      alert("검색할 항목을 선택하세요.");
      return;
    }
  };

  const toggleDelMode = () => {
    setIsDelMode((prev) => !prev);
    if (isDelMode) {
      setSelectedItems([]);
    } else {
      setSelectedItems([]);
    }
  };

  // 정렬 핸들러
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
  };

  return (
    <div className="stockList">
      <div className="stock-buttons">
        <button
          className={isDelMode ? "default-mode-button" : "delete-mode-button"}
          onClick={toggleDelMode}
        >
          {isDelMode ? "기본보기" : "삭제/수정"}
        </button>
        <button className="add-button" onClick={handleAddProduct}>
          추가
        </button>
        <button
          className="edit-button"
          onClick={handleEditProduct}
          disabled={selectedItems.length !== 1}
        >
          수정
        </button>
      </div>
      <table className="s_table">
        <thead>
          <tr>
            {isDelMode && (
              <th>
                <button className="delBtn" onClick={handleDeleteSelectedItems}>
                  삭제
                </button>
              </th>
            )}
            <th
              onClick={() => handleSort("PRODUCTCODE")}
              className="sortable-header"
            >
              제품 코드
            </th>
            <th>제품명</th>
            <th onClick={() => handleSort("COST")} className="sortable-header">
              원가(원)
            </th>
            <th
              onClick={() => handleSort("TOTALQUANTITY")}
              className="sortable-header"
            >
              총수량
            </th>
            <th
              onClick={() => handleSort("GOODQUANTITY")}
              className="sortable-header"
            >
              양품수량
            </th>
            <th
              onClick={() => handleSort("DEFECTIVEQUANTITY")}
              className="sortable-header"
            >
              불량수량
            </th>
            <th
              onClick={() => handleSort("LASTUPDATED")}
              className="sortable-header"
            >
              마지막 재고날짜
            </th>
          </tr>
        </thead>
        <tbody>
          {displayedSs.length === 0 ? (
            <tr>
              <td colSpan={isDelMode ? 8 : 7}>재고 정보가 없습니다.</td>
            </tr>
          ) : (
            displayedSs.map((item) => (
              <tr
                key={item.PRODUCTCODE}
                onClick={(e) => {
                  if (!e.target.closest("input[type='checkbox']")) {
                    openS_Popup(item);
                  }
                }}
              >
                {isDelMode && (
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="s_CheckBox"
                      onChange={() => handleItemSelection(item.PRODUCTID)}
                      checked={selectedItems.includes(item.PRODUCTID)}
                    />
                  </td>
                )}
                <td>{item.PRODUCTCODE}</td>
                <td>{item.PRODUCTNAME}</td>
                <td>{Math.floor(item.COST).toLocaleString()}</td>
                <td>{item.TOTALQUANTITY}</td>
                <td
                  className={`GQ ${
                    item.GOODQUANTITY <= 3 ? "low-quantity" : ""
                  }`}
                >
                  {item.GOODQUANTITY}
                </td>
                <td>{item.DEFECTIVEQUANTITY}</td>
                <td>{new Date(item.LASTUPDATED).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="search-bar">
        <select value={s_KeyField} onChange={handleS_KeyFieldChange}>
          <option value="">선택</option>
          <option value="PRODUCTNAME">제품명</option>
          <option value="PRODUCTCODE">제품 코드</option>
        </select>
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          value={s_KeyWord}
          onChange={handleS_SearchChange}
        />
        <button onClick={handleS_SearchSubmit}>검색</button>
      </div>

      <div className="pagination">
        {Array.from({ length: s_TotalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => handleS_Page(index + 1)}
            className={s_ListPage === index + 1 ? "active" : ""}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {activeTab === "stock" && s_popupData && (
        <div className="popup-overlay">
          <div className="popup">
            <div>
              <h2>불량체크</h2>
              <p>제품 코드: {s_popupData.PRODUCTCODE}</p>
              <p>제품명: {s_popupData.PRODUCTNAME}</p>
              <p>
                불량수량:
                <input
                  type="number"
                  value={s_quantity}
                  onChange={handleS_QuantityChange}
                />
                <b> 개 </b>(<b className="qSize">{s_popupData.GOODQUANTITY}</b>
                <b className="qMessage">개까지 입력가능</b>)
              </p>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              <div className="popup-buttons">
                <button
                  className="pay-button"
                  onClick={handleDefecStock}
                  disabled={!!errorMessage}
                >
                  적용
                </button>
                <button className="cancel-button" onClick={closeS_Popup}>
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockList;
