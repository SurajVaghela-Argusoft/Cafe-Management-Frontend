const CartItemRow = ({ item, details, onIncrease, onDecrease, onRemove }) => (
  <div className="p-3 bg-light border-0 rounded-3 d-flex justify-content-between align-items-center flex-wrap gap-2 small">
    <div className="text-dark">
      <strong className="d-block mb-1 fs-6">{details ? details.item_name : "Loading..."}</strong>
      <span className="text-muted opacity-75">
        Price: ₹{details?.price || "..."} | Total: <strong>₹{(details?.price || 0) * item.quantity}</strong>
      </span>
    </div>

    <div className="d-flex align-items-center gap-2">
      <div className="btn-group shadow-sm bg-white rounded-2 overflow-hidden border border-light-subtle">
        <button onClick={() => onDecrease(item.item_id)} className="btn btn-sm py-1 text-dark border-0 fw-bold">-</button>
        <span className="px-3 d-flex align-items-center bg-white text-dark small fw-semibold">{item.quantity}</span>
        <button onClick={() => onIncrease(item.item_id)} className="btn btn-sm py-1 text-dark border-0 fw-bold">+</button>
      </div>
      <button onClick={() => onRemove(item.item_id)} className="btn btn-sm btn-outline-danger border-0 rounded-2 ms-1 small fw-medium">
        Remove
      </button>
    </div>
  </div>
);

export default CartItemRow;
