// One ordered item row. The parent looks up the name / price.
const OrderItemRow = ({ index, name, quantity, price, className = "bg-light rounded-3" }) => (
  <div className={`${className} p-2 px-3 d-flex align-items-center justify-content-between text-dark small`}>
    <div>
      <span className="text-muted me-2 fw-medium">{index + 1}.</span>
      <span className="fw-semibold">{name}</span>
    </div>
    <div className="text-muted">
      <span className="mx-2">Qty: <strong className="text-dark">{quantity}</strong></span>
      <span className="ms-2">Price: <strong className="text-dark">{price}</strong></span>
    </div>
  </div>
);

export default OrderItemRow;
