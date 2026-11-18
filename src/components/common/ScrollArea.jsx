const ScrollArea = ({ className = "", children }) => (
  <div className={`overflow-y-auto pe-1 flex-grow-1 ${className}`} style={{ minHeight: 0, scrollBehavior: "smooth" }}>
    {children}
  </div>
);

export default ScrollArea;
