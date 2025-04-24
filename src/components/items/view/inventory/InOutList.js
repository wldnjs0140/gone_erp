import React from "react";

function InOutList({
  io_List,
  io_ListPage,
  io_TotalPages,
  handleIo_Page,
  sortConfig, // 정렬 상태 props 추가
  handleSort, // 정렬 핸들러 props 추가
}) {
  return (
    <div className="ioList">
      {/* 입출고 정보 표시 */}
      <table>
        <thead>
          <tr>
            <th
              onClick={() => handleSort("TRANSACTIONID")}
              className="sortable-header"
            >
              번호
              {sortConfig.key === "TRANSACTIONID"}
            </th>
            <th>제품 코드</th>
            <th
              onClick={() => handleSort("TRANSACTIONTYPE")}
              className="sortable-header"
            >
              입고/출고
              {sortConfig.key === "TRANSACTIONTYPE"}
            </th>
            <th
              onClick={() => handleSort("QUANTITY")}
              className="sortable-header"
            >
              수량
              {sortConfig.key === "QUANTITY"}
            </th>
            <th
              onClick={() => handleSort("TRANSACTIONDATE")}
              className="sortable-header"
            >
              날짜
              {sortConfig.key === "TRANSACTIONDATE"}
            </th>
            <th>비고</th>
          </tr>
        </thead>
        <tbody>
          {io_List.length === 0 ? (
            <tr>
              <td colSpan="6">입출고 정보가 없습니다.</td>
            </tr>
          ) : (
            io_List
              .slice((io_ListPage - 1) * 15, io_ListPage * 15)
              .map((item) => (
                <tr key={item.TRANSACTIONID}>
                  <td>{item.TRANSACTIONID}</td>
                  <td>{item.PRODUCTCODE}</td>
                  <td>{item.TRANSACTIONTYPE}</td>
                  <td>{item.QUANTITY}</td>
                  <td>{new Date(item.TRANSACTIONDATE).toLocaleDateString()}</td>
                  <td>{item.NOTE}</td>
                </tr>
              ))
          )}
        </tbody>
      </table>

      {/* 입출고 리스트 페이징 */}
      <div className="pagination">
        {Array.from({ length: io_TotalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => handleIo_Page(index + 1)}
            className={io_ListPage === index + 1 ? "active" : ""}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default InOutList;
