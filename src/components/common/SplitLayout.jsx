const SplitLayout = ({ left, right, leftCols = 5, centerLeft = true }) => (
  <div className="container-fluid bg-secondary-subtle px-4" style={{ height: "calc(100vh - 80px)" }}>
    <div className="row h-100 g-4 align-items-stretch">
      <div className={`col-md-${leftCols} h-100 py-4 ${centerLeft ? "d-flex align-items-center" : ""}`}>{left}</div>
      <div className={`col-md-${12 - leftCols} h-100 py-4`}>{right}</div>
    </div>
  </div>
);

export default SplitLayout;
