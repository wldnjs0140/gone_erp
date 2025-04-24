import React, { useState } from "react";

function EditStockForm({
  setRefreshTrigger,
  editData,
  setEditData,
  setActiveTab,
}) {
  const getStringDate = (date) => date.toISOString().slice(0, 10);
  const [date, setDate] = useState(getStringDate(new Date()));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {
      ...editData,
      GOODQUANTITY: parseInt(editData.GOODQUANTITY),
      DEFECTIVEQUANTITY: parseInt(editData.DEFECTIVEQUANTITY),
      COST: parseFloat(editData.COST),
      DESCRIPTION: parseInt(editData.DESCRIPTION || 0), // 할인율 추가, null이면 0
      LAST_STOCK_DATE: date,
    };

    try {
      const response = await fetch("http://localhost:84/api/update-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("서버와의 통신에 실패했습니다.");
      }

      const result = await response.json();

      if (result.success) {
        alert("재고 정보가 수정되었습니다.");
        setRefreshTrigger((prev) => prev + 1);
        setActiveTab("stock");
      } else {
        alert(result.message || "서버 오류");
      }
    } catch (error) {
      alert(error.message || "오류가 발생했습니다.");
    }
  };

  return (
    <div className="editStockArea">
      <form onSubmit={handleSubmit}>
        <h2>재고수정</h2>
        <label>
          <span>제품 코드:</span>
          <input
            name="PRODUCTCODE"
            value={editData.PRODUCTCODE}
            disabled
            readOnly
          />
        </label>
        <label>
          <span>제품:</span>
          <input
            name="PRODUCTNAME"
            value={editData.PRODUCTNAME}
            onChange={(e) =>
              setEditData({ ...editData, PRODUCTNAME: e.target.value })
            }
            required
            disabled
          />
        </label>
        <label>
          <span>원가:</span>
          <input
            name="COST"
            type="number"
            value={editData.COST}
            onChange={(e) => setEditData({ ...editData, COST: e.target.value })}
            required
          />
        </label>
        <label>
          <span>양품수량:</span>
          <input
            type="number"
            name="GOODQUANTITY"
            value={editData.GOODQUANTITY}
            onChange={(e) =>
              setEditData({ ...editData, GOODQUANTITY: e.target.value })
            }
            required
          />
        </label>
        <label>
          <span>불량수량:</span>
          <input
            type="number"
            name="DEFECTIVEQUANTITY"
            value={editData.DEFECTIVEQUANTITY}
            onChange={(e) =>
              setEditData({ ...editData, DEFECTIVEQUANTITY: e.target.value })
            }
            required
          />
        </label>
        <label>
          <span>할인율(%):</span>
          <input
            type="number"
            name="DESCRIPTION"
            value={editData.DESCRIPTION || ""}
            onChange={(e) =>
              setEditData({ ...editData, DESCRIPTION: e.target.value })
            }
            placeholder={editData.DESCRIPTION ? editData.DESCRIPTION : "0"}
            min="0"
            max="100"
          />
        </label>
        <label>
          <span>마지막 재고날짜:</span>
          <input
            name="LAST_STOCK_DATE"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            disabled
          />
        </label>
        <button type="submit">수정</button>
        <button type="button" onClick={() => setActiveTab("stock")}>
          목록으로
        </button>
      </form>
    </div>
  );
}

export default EditStockForm;
