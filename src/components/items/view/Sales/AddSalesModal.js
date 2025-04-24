import React, { useState } from "react";
// import "../../css/styles.css";

const AddSalesModal = ({ onAddSale, onClose }) => {
  const [newSale, setNewSale] = useState({
    productCode: "",
    quantitySold: "",
    totalAmount: "",
    cost: "",
    salesDate: "",
    paymentType: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  const validateSale = (sale) => {
    const errors = {};

    if (!sale.productCode || !/^[A-Z0-9]{5,10}$/.test(sale.productCode)) {
      errors.productCode =
        "제품 코드는 5-10자의 대문자와 숫자로 구성되어야 합니다.";
    }

    const quantitySold = parseInt(sale.quantitySold);
    if (isNaN(quantitySold) || quantitySold <= 0) {
      errors.quantitySold = "판매 수량은 1 이상이어야 합니다.";
    }

    const totalAmount = parseFloat(sale.totalAmount);
    if (isNaN(totalAmount) || totalAmount <= 0 || totalAmount > 100_000_000) {
      errors.totalAmount =
        "총판매금액은 1원에서 100,000,000원 사이여야 합니다.";
    }

    if (!sale.salesDate || !/^\d{4}-\d{2}-\d{2}$/.test(sale.salesDate)) {
      errors.salesDate = "판매 날짜는 YYYY-MM-DD 형식이어야 합니다.";
    }

    const validPaymentTypes = ["카드", "현금", "계좌이체", "환불"];
    if (!sale.paymentType || !validPaymentTypes.includes(sale.paymentType)) {
      errors.paymentType = "유효하지 않은 결제 구분입니다.";
    }

    return errors;
  };

  const handleSubmit = () => {
    const errors = validateSale(newSale);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    onAddSale(newSale);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <h2>매출 등록</h2>
        <div className="modal-input-group">
          <label>제품코드</label>
          <input
            type="text"
            value={newSale.productCode}
            onChange={(e) =>
              setNewSale({ ...newSale, productCode: e.target.value })
            }
          />
          {validationErrors.productCode && (
            <p className="error-message">{validationErrors.productCode}</p>
          )}
        </div>
        <div className="modal-input-group">
          <label>판매수량</label>
          <input
            type="number"
            value={newSale.quantitySold}
            onChange={(e) =>
              setNewSale({ ...newSale, quantitySold: e.target.value })
            }
          />
          {validationErrors.quantitySold && (
            <p className="error-message">{validationErrors.quantitySold}</p>
          )}
        </div>
        <div className="modal-input-group">
          <label>판매금액</label>
          <input
            type="number"
            value={newSale.totalAmount}
            onChange={(e) =>
              setNewSale({ ...newSale, totalAmount: e.target.value })
            }
          />
          {validationErrors.totalAmount && (
            <p className="error-message">{validationErrors.totalAmount}</p>
          )}
        </div>

        <div className="modal-input-group">
          <label>등록일</label>
          <input
            type="date"
            value={newSale.salesDate}
            onChange={(e) =>
              setNewSale({ ...newSale, salesDate: e.target.value })
            }
          />
          {validationErrors.salesDate && (
            <p className="error-message">{validationErrors.salesDate}</p>
          )}
        </div>
        <div className="modal-input-group">
          <label>결제구분</label>
          <select
            value={newSale.paymentType}
            onChange={(e) =>
              setNewSale({ ...newSale, paymentType: e.target.value })
            }
          >
            <option value="">결제 구분 선택</option>
            <option value="카드">카드</option>
            <option value="현금">현금</option>
            <option value="계좌이체">계좌이체</option>
            <option value="환불">환불</option>
          </select>
          {validationErrors.paymentType && (
            <p className="error-message">{validationErrors.paymentType}</p>
          )}
        </div>
        <div className="sales-modal-buttons">
          <button className="add-btn" onClick={handleSubmit}>
            등록
          </button>
          <button className="cancel-btn" onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSalesModal;
