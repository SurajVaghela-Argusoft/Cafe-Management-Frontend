const IndexBadge = ({ children }) => (
  <span className="position-absolute top-0 end-0 m-4 badge bg-light text-dark border border-light-subtle rounded-circle d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px", fontWeight: 600 }}>
    {children}
  </span>
);

export default IndexBadge;
