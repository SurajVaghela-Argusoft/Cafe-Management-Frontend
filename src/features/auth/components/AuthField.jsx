// label + input used on the login / register forms
const AuthField = ({ label, id, className = "mb-3", ...props }) => (
  <div className={className}>
    <label htmlFor={id} className="form-label small fw-semibold text-dark opacity-50 mb-1">{label}</label>
    <input
      id={id}
      className="form-control bg-light border-0 px-3 rounded-3 text-dark fs-6"
      style={{ outline: "none" }}
      {...props}
    />
  </div>
);

export default AuthField;
