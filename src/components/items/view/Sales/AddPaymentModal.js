import React, { useState, useEffect } from "react";

const AddPaymentModal = ({ onAddPayment, onClose }) => {
  const [newPayment, setNewPayment] = useState({
    productCode: "",
    paymentAmount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "",
    quantitySold: "",
    useYn: "Y",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [productInfo, setProductInfo] = useState({
    productName: "",
    unitPrice: 0,
  });

  // 제품 정보 조회 함수
  const fetchProductInfo = async () => {
    if (
      newPayment.productCode &&
      /^[A-Z0-9]{5,10}$/.test(newPayment.productCode)
    ) {
      try {
        const response = await fetch(
          `http://localhost:84/api/product-info?code=${newPayment.productCode}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error("제품 정보를 가져오지 못했습니다.");
        const data = await response.json();
        if (data.success) {
          setProductInfo({
            productName: data.data.productName || "알 수 없는 제품",
            unitPrice: data.data.unitPrice || 0,
          });
          // 결제 금액을 단가로 초기화 (수량 입력 전이므로 단가만 설정)
          setNewPayment((prev) => ({
            ...prev,
            paymentAmount: data.data.unitPrice.toString(),
          }));
          setValidationErrors((prev) => ({ ...prev, productCode: "" }));
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        setValidationErrors((prev) => ({
          ...prev,
          productCode: error.message,
        }));
        setProductInfo({ productName: "", unitPrice: 0 });
        setNewPayment((prev) => ({ ...prev, paymentAmount: "" }));
      }
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        productCode: "제품 코드는 5-10자의 대문자와 숫자로 구성되어야 합니다.",
      }));
    }
  };

  // 수량 변경 시 결제 금액 업데이트
  useEffect(() => {
    if (productInfo.unitPrice && newPayment.quantitySold) {
      const quantity = parseInt(newPayment.quantitySold);
      if (!isNaN(quantity) && quantity > 0) {
        const calculatedAmount = productInfo.unitPrice * quantity;
        setNewPayment((prev) => ({
          ...prev,
          paymentAmount: calculatedAmount.toString(),
        }));
      }
    }
  }, [newPayment.quantitySold, productInfo.unitPrice]);

  const validatePayment = (payment) => {
    const errors = {};

    if (!payment.productCode || !/^[A-Z0-9]{5,10}$/.test(payment.productCode)) {
      errors.productCode =
        "제품 코드는 5-10자의 대문자와 숫자로 구성되어야 합니다.";
    }

    const paymentAmount = parseFloat(payment.paymentAmount);
    if (
      isNaN(paymentAmount) ||
      paymentAmount <= 0 ||
      paymentAmount > 100_000_000
    ) {
      errors.paymentAmount =
        "결제 금액은 1원에서 100,000,000원 사이여야 합니다.";
    }

    const quantitySold = parseInt(payment.quantitySold);
    if (isNaN(quantitySold) || quantitySold <= 0) {
      errors.quantitySold = "판매 수량은 1 이상이어야 합니다.";
    }

    // 결제 금액과 단가 * 수량 검증
    const calculatedAmount = productInfo.unitPrice * quantitySold;
    if (Math.abs(paymentAmount - calculatedAmount) > 0.01) {
      errors.paymentAmount = `결제 금액은 ${calculatedAmount.toLocaleString()}원(단가 ${productInfo.unitPrice.toLocaleString()}원 × 수량 ${quantitySold})이어야 합니다.`;
    }

    if (
      !payment.paymentDate ||
      !/^\d{4}-\d{2}-\d{2}$/.test(payment.paymentDate)
    ) {
      errors.paymentDate = "결제 날짜는 YYYY-MM-DD 형식이어야 합니다.";
    }

    const validPaymentMethods = ["카드", "현금", "계좌이체", "환불"];
    if (
      !payment.paymentMethod ||
      !validPaymentMethods.includes(payment.paymentMethod)
    ) {
      errors.paymentMethod = "유효하지 않은 결제 방식입니다.";
    }

    return errors;
  };

  const handleSubmit = () => {
    const errors = validatePayment(newPayment);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // 확인 창 표시
    const totalAmount = parseFloat(newPayment.paymentAmount);
    const quantitySold = parseInt(newPayment.quantitySold);
    const confirmMessage = `
      제품명: ${productInfo.productName}
      판매 수량: ${quantitySold}
      총 결제 금액: ${totalAmount.toLocaleString()}원
      위 정보를 추가하시겠습니까?
    `;
    if (window.confirm(confirmMessage)) {
      onAddPayment(newPayment);
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <h2>결제 내역 추가</h2>
        <div className="modal-input-group">
          <div className="product-code-group">
            <input
              type="text"
              placeholder="제품 코드 5-10자"
              value={newPayment.productCode}
              onChange={(e) =>
                setNewPayment({
                  ...newPayment,
                  productCode: e.target.value.toUpperCase(),
                })
              }
            />
            <button className="lookup-btn" onClick={fetchProductInfo}>
              조회
            </button>
          </div>
          {validationErrors.productCode && (
            <p className="error-message">{validationErrors.productCode}</p>
          )}
          {productInfo.productName && (
            <p className="product-info">제품명: {productInfo.productName}</p>
          )}
        </div>
        <div className="modal-input-group">
          <input
            type="text"
            placeholder="결제 금액"
            value={newPayment.paymentAmount}
            readOnly // 결제 금액은 단가와 수량에 의해 자동 계산
          />
          {validationErrors.paymentAmount && (
            <p className="error-message">{validationErrors.paymentAmount}</p>
          )}
        </div>
        <div className="modal-input-group">
          <input
            type="number"
            placeholder="판매 수량 (1 이상)"
            value={newPayment.quantitySold}
            onChange={(e) =>
              setNewPayment({ ...newPayment, quantitySold: e.target.value })
            }
          />
          {validationErrors.quantitySold && (
            <p className="error-message">{validationErrors.quantitySold}</p>
          )}
        </div>
        <div className="modal-input-group">
          <input
            type="date"
            value={newPayment.paymentDate}
            onChange={(e) =>
              setNewPayment({ ...newPayment, paymentDate: e.target.value })
            }
          />
          {validationErrors.paymentDate && (
            <p className="error-message">{validationErrors.paymentDate}</p>
          )}
        </div>
        <div className="modal-input-group">
          <select
            value={newPayment.paymentMethod}
            onChange={(e) =>
              setNewPayment({ ...newPayment, paymentMethod: e.target.value })
            }
          >
            <option value="">결제 방식 선택</option>
            <option value="카드">카드</option>
            <option value="현금">현금</option>
            <option value="계좌이체">계좌이체</option>
            <option value="환불">환불</option>
          </select>
          {validationErrors.paymentMethod && (
            <p className="error-message">{validationErrors.paymentMethod}</p>
          )}
        </div>
        <div className="payment-modal-buttons">
          <button className="add-btn" onClick={handleSubmit}>
            추가
          </button>
          <button className="cancel-btn" onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPaymentModal;
