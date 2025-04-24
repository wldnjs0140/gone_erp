function ProductList({
  p_ListPage,
  p_TotalPages,
  p_KeyField,
  p_KeyWord,
  handleP_SearchChange,
  handleP_KeyFieldChange,
  handleP_SearchSubmit,
  filteredPs,
  handleP_Page,
  openPopup,
  sortConfig,
  handleSort,
}) {
  return (
    <div className="productList">
      {/* 제품 리스트 */}
      <div>
        <table>
          <thead>
            <tr>
              <th
                onClick={() => handleSort("PRODUCTCODE")}
                className="sortable-header"
              >
                제품 코드
                {sortConfig.key === "PRODUCTCODE"}
              </th>
              <th>제품명</th>
              <th>카테고리</th>
              <th
                onClick={() => handleSort("DISCOUNTED_PRICE")}
                className="sortable-header"
              >
                가격
                {sortConfig.key === "DISCOUNTED_PRICE"}
              </th>
              <th
                onClick={() => handleSort("GOODQUANTITY")}
                className="sortable-header"
              >
                수량
                {sortConfig.key === "GOODQUANTITY"}
              </th>
              <th
                onClick={() => handleSort("REGDATE")}
                className="sortable-header"
              >
                등록일
                {sortConfig.key === "REGDATE"}
              </th>
              <th
                onClick={() => handleSort("DESCRIPTION")}
                className="sortable-header"
              >
                비고
                {sortConfig.key === "DESCRIPTION"}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPs.length === 0 ? (
              <tr>
                <td colSpan="7">제품이 없습니다.</td>
              </tr>
            ) : (
              filteredPs
                .slice((p_ListPage - 1) * 15, p_ListPage * 15)
                .map((item) => (
                  <tr key={item.PRODUCTCODE} onClick={() => openPopup(item)}>
                    <td>{item.PRODUCTCODE}</td>
                    <td>{item.PRODUCTNAME}</td>
                    <td>{item.CATEGORY}</td>
                    <td
                      className={
                        item.DISCOUNTED_PRICE !== item.PRICE
                          ? "discounted-price"
                          : ""
                      }
                    >
                      {item.DISCOUNTED_PRICE !== item.PRICE
                        ? `(할인) ${item.DISCOUNTED_PRICE.toLocaleString()} 원`
                        : `${item.PRICE.toLocaleString()} 원`}
                    </td>
                    <td>{item.GOODQUANTITY}</td>
                    <td>{new Date(item.REGDATE).toLocaleDateString()}</td>
                    <td>
                      {item.DESCRIPTION ? `${item.DESCRIPTION}% 할인` : "-"}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
        {/* 검색 영역 */}
        <div className="search-bar">
          <select value={p_KeyField} onChange={handleP_KeyFieldChange}>
            <option value="">선택</option>
            <option value="PRODUCTNAME">제품명</option>
            <option value="PRODUCTCODE">제품 코드</option>
            <option value="CATEGORY">카테고리</option>
          </select>
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={p_KeyWord}
            onChange={handleP_SearchChange}
          />
          <button onClick={handleP_SearchSubmit}>검색</button>
        </div>
      </div>

      {/* 제품리스트 페이징 */}
      <div className="pagination">
        {Array.from({ length: p_TotalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => handleP_Page(index + 1)}
            className={p_ListPage === index + 1 ? "active" : ""}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
