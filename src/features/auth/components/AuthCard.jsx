import AlertMessage from "../../../components/common/AlertMessage";

// Centered card shared by Login and Register
const AuthCard = ({ title, subtitle, error, footer, children }) => (
  <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100 bg-secondary-subtle p-4">
    <div className="p-4 p-md-5 border-0 rounded-4 w-100 bg-white shadow" style={{ maxWidth: "440px" }}>
      <div className="text-center mb-4">
        <h2 className="fw-bold text-dark fs-3 mb-1" style={{ letterSpacing: "-0.5px" }}>{title}</h2>
        <p className="text-muted small">{subtitle}</p>
      </div>

      <AlertMessage message={error ? { text: error, type: "error" } : null} />

      {children}

      <div className="text-center pt-3 border-top border-light-subtle">{footer}</div>
    </div>
  </div>
);

export default AuthCard;
