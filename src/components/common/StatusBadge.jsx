// dark when `active` (completed / active), light otherwise
const StatusBadge = ({ active, children }) => (
  <span
    className={`rounded-2 px-2 py-1 small fw-medium border ${
      active ? "bg-dark text-white border-dark" : "bg-light text-muted border-light-subtle"
    }`}
  >
    {children}
  </span>
);

export default StatusBadge;
