// Page wrapper for stacked cards. Children are usually <div className="col-12">
const ListPage = ({ children }) => (
  <div className="container my-3 py-5 bg-secondary-subtle rounded-4 px-4 min-vh-100">
    <div className="row g-4">{children}</div>
  </div>
);

export default ListPage;
