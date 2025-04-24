import React, { useState } from "react";

function PaymentPopup({
  activeTab,
  popupData,
  p_quantity,
  setP_Quantity,
  errorMessage,
  setErrorMessage,
  handlePayment,
  closePopup,
}) {
  // 결제 수단 상태 추가
  const [paymentMethod, setPaymentMethod] = useState("현금"); // 기본값: 현금

  // 조건에 맞게 팝업 표시
  if (activeTab !== "p_List" || !popupData) return null;

  // 결제 수단 변경 핸들러
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  // handlePayment에 paymentMethod를 전달하기 위해 래핑
  const handlePaymentWithMethod = () => {
    if (p_quantity === 0) {
      setErrorMessage("수량을 0으로 설정할 수 없습니다.");
      return;
    }
    if (p_quantity > popupData.GOODQUANTITY) {
      setErrorMessage(
        "총수량(" + popupData.GOODQUANTITY + "개) 미만으로 입력하세요."
      );
      return;
    } else {
      setErrorMessage("");
    }
    handlePayment(paymentMethod);
  };

  const handleP_QuantityChange = (e) => {
    const newQuantity = e.target.value === "" ? "" : Number(e.target.value);
    setP_Quantity(newQuantity);

    if (newQuantity !== "" && newQuantity > popupData?.GOODQUANTITY) {
      setErrorMessage(
        `총수량(${popupData.GOODQUANTITY}개)  이하로 입력하세요.`
      );
    } else {
      setErrorMessage("");
    }
  };

  const priceToUse =
    popupData.DISCOUNTED_PRICE !== popupData.PRICE
      ? popupData.DISCOUNTED_PRICE
      : popupData.PRICE;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closePopup(); // 모달 바깥 클릭 시 닫기
    }
  };
  return (
    <div className="popup" onClick={handleOverlayClick}>
      <div>
        <h2>{popupData.PRODUCTNAME}</h2>
        <p>제품 코드: {popupData.PRODUCTCODE}</p>
        <p>가격: {priceToUse.toLocaleString()} 원</p>
        <p>
          수량:
          <input
            type="number"
            value={p_quantity}
            min="1"
            onChange={handleP_QuantityChange}
          />
          <b> 개 </b>(<b className="qSize">{popupData.GOODQUANTITY}</b>
          <b className="qMessage">개까지 입력가능</b>)
        </p>
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        {/* 결제 수단 선택 */}
        <p>
          결제 수단:
          <select
            className="pay-sel"
            value={paymentMethod}
            onChange={handlePaymentMethodChange}
          >
            <option value="현금">현금</option>
            <option value="카드">카드</option>
            <option value="계좌이체">계좌이체</option>
          </select>
        </p>
        {/* 에러 메시지 표시 */}
        <p>총 금액: {(p_quantity * priceToUse).toLocaleString()} 원</p>
        {/* 버튼들: 에러 메시지에 따라 버튼 활성화/비활성화 */}
        <div className="popup-buttons">
          <button
            className="pay-button"
            onClick={handlePaymentWithMethod}
            disabled={!!errorMessage}
          >
            결제
          </button>
          <button className="cancel-button" onClick={closePopup}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentPopup;
