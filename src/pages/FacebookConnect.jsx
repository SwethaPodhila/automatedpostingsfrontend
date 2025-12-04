export default function FacebookConnect() {
  const BACKEND_URL = "https://automatedpostingbackend.onrender.com";

  const connectFacebook = () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please login first!");
      return;
    }

    window.location.href =
      `${BACKEND_URL}/social/facebook?userId=${userId}`;
  };

  return (
    <button
      onClick={connectFacebook}
      style={{
        padding: "12px 25px",
        backgroundColor: "#1877F2",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        marginTop: "20px",
      }}
    >
      Connect with Facebook
    </button>
    
  );
}
