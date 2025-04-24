import React, { useState } from "react";

function AddStockForm({ setRefreshTrigger, closeAddTab }) {
  const getStringDate = (date) => date.toISOString().slice(0, 10);
  const [date, setDate] = useState(getStringDate(new Date()));
  const [productCode, setProductCode] = useState(""); // 서버에서 받은 코드로 설정
  const [productName, setProductName] = useState("");
  const [cost, setCost] = useState("");
  const [quantity, setQuantity] = useState("");
  const [categoryID, setCategoryID] = useState("1");

  // 서버에서 고유한 제품 코드 요청
  const handleCodeGenerate = async () => {
    try {
      const response = await fetch("http://localhost:84/generateCode", {
        method: "GET",
      });
      if (!response.ok) throw new Error("제품 코드 생성 실패");
      const newProductCode = await response.text(); // 서버에서 반환된 고유 코드
      setProductCode(newProductCode);
    } catch (error) {
      // console.error("제품 코드 생성 중 오류 발생:", error);
      alert("제품 코드 생성에 실패했습니다.");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      PRODUCTCODE: productCode,
      PRODUCTNAME: productName,
      CATEGORYID: categoryID,
      COST: cost,
      TOTALQUANTITY: quantity,
      LASTUPDATED: date,
      TRANSACTIONTYPE: "IN", // addInOut에 필요
      QUANTITY: quantity, // addInOut에 필요
      TRANSACTIONDATE: date, // addInOut에 필요
      NOTE: "신규 재고 입고", // addInOut에 필요
    };

    try {
      const response = await fetch("http://localhost:84/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: new URLSearchParams(formData).toString(),
      });

      if (!response.ok) throw new Error("재고 추가 실패");

      const result = await response.json();
      if (result.success) {
        alert("재고가 성공적으로 추가되었습니다.");
        setRefreshTrigger((prev) => prev + 1);
        closeAddTab();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      // console.error("재고 추가 오류:", error);
      alert("재고 추가에 실패했습니다: " + error.message);
    }
  };

  return (
    <div className="addStockArea">
      <form onSubmit={handleAddSubmit}>
        <h2>재고추가</h2>
        <label>
          <span>제품코드:</span>
          <input name="PRODUCTCODE" value={productCode} required disabled />
          <button
            className="codeBtn"
            type="button"
            onClick={handleCodeGenerate}
          >
            코드생성
          </button>
        </label>
        <label>
          제품명:
          <input
            name="PRODUCTNAME"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </label>
        <label>
          <span>카테고리:</span>
          <select
            name="CATEGORYID"
            value={categoryID}
            onChange={(e) => setCategoryID(e.target.value)}
            required
          >
            <option value="1">동양화</option>
            <option value="2">서양화</option>
            <option value="3">초상화</option>
          </select>
        </label>
        <label>
          <span>원가:</span>
          <input
            name="COST"
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
          />
        </label>
        <label>
          <span>총 수량:</span>
          <input
            name="TOTALQUANTITY"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </label>
        <label>
          <span>마지막 재고날짜:</span>
          <input
            name="LASTUPDATED"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
        <button type="submit">추가</button>
        <button type="button" onClick={closeAddTab}>
          목록으로
        </button>
      </form>
    </div>
  );
}

export default AddStockForm;
