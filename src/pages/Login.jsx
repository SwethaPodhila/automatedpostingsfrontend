import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        try {
            const res = await axios.post("https://automatedpostingbackend.onrender.com/user/login", form);

            if (res.data.success) {
                alert("Login successful");
                localStorage.setItem("token", res.data.token);
                navigate("/dashboard"); // Proper React Router navigation
            } else {
                alert(res.data.msg);
            }
        } catch (err) {
            console.log(err);
            alert("Server error");
        }
    };

    return (
        <div style={{ width: "300px", margin: "80px auto", textAlign: "center" }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    style={styles.input}
                    autoComplete="username"
                    required
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    onChange={handleChange}
                    style={styles.input}
                    autoComplete="current-password"
                    required
                />
                <button type="submit" style={styles.btn}>Login</button>
            </form>
        </div>
    );
}

const styles = {
    input: { width: "100%", padding: "10px", margin: "8px 0" },
    btn: { width: "100%", padding: "10px", background: "#28a745", color: "white", border: "none" },
};