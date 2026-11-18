// White rounded card
const Panel = ({ title, subtitle, className = "", children }) => (
  <div className={`p-4 bg-white rounded-4 shadow-sm ${className}`}>
    {title && (
      <h2 className={`fw-bold text-dark fs-4 mb-${subtitle ? 1 : 3}`} style={{ letterSpacing: "-0.5px" }}>
        {title}
      </h2>
    )}
    {subtitle && <p className="text-muted small mb-3">{subtitle}</p>}
    {children}
  </div>
);

export default Panel;
