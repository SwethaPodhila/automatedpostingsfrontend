import React, { useState } from "react";
import axios from "axios";
import { href } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [showOtpBox, setShowOtpBox] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const res = await axios.post("https://automatedpostingbackend.onrender.com/user/register", form);
      if (res.data.success) {
        alert("OTP sent to your email");
        setShowOtpBox(true);
      } else {
        alert(res.data.msg);
      }
    } catch (err) {
      console.log(err);
      alert("Server Error");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post("https://automatedpostingbackend.onrender.com/user/verify-otp", {
        email: form.email,
        otp,
      });

      if (res.data.success) {
        alert("Account verified successfully!");
        localStorage.setItem("token", res.data.token);
        window.location.href = "/dashboard";
      } else {
        alert(res.data.msg);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Register</h2>

      <input name="name" placeholder="Name" onChange={handleChange} style={styles.input} />
      <input name="email" placeholder="Email" onChange={handleChange} style={styles.input} />
      <input name="phone" placeholder="Phone" onChange={handleChange} style={styles.input} />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} style={styles.input} />

      <button onClick={handleRegister} style={styles.btn}>Register</button>

      {showOtpBox && (
        <>
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleVerifyOtp} style={styles.btn}>Verify OTP</button>
        </>
      )}
    </div>
  );
}

const styles = {
  container: { width: "350px", margin: "50px auto", textAlign: "center" },
  input: { width: "100%", margin: "8px 0", padding: "10px" },
  btn: { padding: "10px", width: "100%", marginTop: "10px", background: "#007bff", color: "#fff", border: "none" }
};
