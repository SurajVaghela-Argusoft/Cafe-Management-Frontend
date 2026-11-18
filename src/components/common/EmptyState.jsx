const VARIANTS = {
  panel: "text-muted small my-auto text-center",
  box: "text-muted small bg-light p-3 rounded-3 border-0 text-center mb-0",
  card: "text-muted small bg-white p-4 rounded-4 shadow-sm text-center mb-0",
};

// variant: "panel" (centered inside a panel) | "box" (grey box) | "card" (white card)
// fullHeight: centered message that fills the screen under the navbar
const EmptyState = ({ text, variant = "panel", fullHeight = false }) =>
  fullHeight ? (
    <div className="d-flex align-items-center justify-content-center bg-secondary-subtle"
      style={{ height: "calc(100vh - 80px)" }}>
      <p className="text-muted bg-white p-4 rounded-4 shadow-sm small text-center mb-0">{text}</p>
    </div>
  ) : (
    <p className={VARIANTS[variant]}>{text}</p>
  );

export default EmptyState;
