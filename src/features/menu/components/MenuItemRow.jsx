const MenuItemRow = ({ item, isLoggedIn, onAddToCart, unavailable = false }) => (
  <div className={`p-3 bg-light border-0 rounded-3 d-flex justify-content-between align-items-center flex-wrap gap-3 ${unavailable ? "opacity-50" : ""}`}>
    <div className="text-dark small">
      <strong className="text-dark d-block mb-1 fs-6">{item.item_name}</strong>
      <div className="d-flex align-items-center gap-2 text-muted">
        <span className="badge bg-white text-muted border-light-subtle rounded-2 px-2 fw-medium" style={{ fontSize: "0.7rem" }}>
          {item.item_size}
        </span>
        <span>•</span>
        <strong className="text-dark fw-semibold">Rs. {item.price}</strong>
        {unavailable && <span className="badge bg-danger-subtle text-danger">Unavailable</span>}
      </div>
    </div>

    {isLoggedIn && (
      <button
        type="button"
        onClick={() => onAddToCart(item.item_id, item.item_name)}
        disabled={unavailable}
        className="btn btn-sm btn-dark rounded-3 px-3 py-2 fw-semibold border-0 shadow-sm"
        style={{ fontSize: "0.8rem", letterSpacing: "0.2px" }}
      >
        {unavailable ? "Not Available" : "Add to Cart"}
      </button>
    )}
  </div>
);

export default MenuItemRow;