import React from "react";

const HrTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="tabs">
      <button
        className={activeTab === "employee" ? "active" : ""}
        onClick={() => setActiveTab("employee")}
      >
        사원 관리
      </button>
      <button
        className={activeTab === "attendance" ? "active" : ""}
        onClick={() => setActiveTab("attendance")}
      >
        근태 관리
      </button>
      <button
        className={activeTab === "salary" ? "active" : ""}
        onClick={() => setActiveTab("salary")}
      >
        급여 관리
      </button>
    </div>
  );
};

export default HrTabs;
