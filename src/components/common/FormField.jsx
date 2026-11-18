// <FormField label="Name" id="name" value={..} onChange={..} />
// <FormField as="select" ...>{options}</FormField>     <FormField as="textarea" ... />
const FormField = ({ label, id, as: Tag = "input", className = "mb-3", children, ...props }) => (
  <div className={className}>
    <label htmlFor={id} className="form-label small fw-semibold text-secondary">
      {label}
    </label>
    <Tag
      id={id}
      className={`${Tag === "select" ? "form-select" : "form-control"} bg-light border-0 py-2`}
      {...props}
    >
      {children}
    </Tag>
  </div>
);

export default FormField;
