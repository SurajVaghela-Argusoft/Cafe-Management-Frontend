// message = { text, type: "success" | "error" }
const AlertMessage = ({ message }) => {
  if (!message?.text) return null;
  const isError = message.type === "error";

  return (
    <div
      className={`alert p-2 mb-3 rounded small text-center fw-medium border-0 ${
        isError ? "alert-danger bg-danger-subtle text-danger" : "alert-dark bg-dark text-white"
      }`}
    >
      {message.text}
    </div>
  );
};

export default AlertMessage;

