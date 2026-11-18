import Panel from "./Panel";

// Centered 650px page (cart, order summary)
const NarrowPage = ({ title, subtitle, children }) => (
  <div className="container py-4 bg-secondary-subtle rounded-4 min-vh-100 px-4" style={{ maxWidth: "650px" }}>
    <Panel title={title} subtitle={subtitle}>
      {children}
    </Panel>
  </div>
);

export default NarrowPage;
