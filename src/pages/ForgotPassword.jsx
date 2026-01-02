import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "https://automatedpostingbackend-h9dc.onrender.com";

export default function ForgotPassword() {
    const sectionRef = useRef(null);

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const [step, setStep] = useState(1);
    const [msg, setMsg] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // 🔥 Smooth scroll when step changes
    useEffect(() => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [step]);

    // 1️⃣ SEND OTP
    const sendOtp = async () => {
        if (!email) return setError("Email required");

        try {
            setLoading(true);
            const res = await axios.post(
                `${API_BASE_URL}/user/forgot-password`,
                { email }
            );

            setMsg(res.data.msg);
            setError("");
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.msg || "Server error");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        console.log("VERIFY OTP DATA 👉", { email, otp });

        if (!otp) return setError("OTP required");

        try {
            setLoading(true);

            const res = await axios.post(
                `${API_BASE_URL}/user/verify-otp-for-forgot-password`,
                {
                    email: email.trim(),
                    otp: otp.trim(),
                }
            );

            if (res.data.success) {
                setMsg("OTP verified successfully");
                setError("");
                setStep(3);
            }
        } catch (err) {
            setError(err.response?.data?.msg || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    // 3️⃣ RESET PASSWORD
    const resetPassword = async () => {
        if (!password || !confirm)
            return setError("All fields required");

        if (password !== confirm)
            return setError("Passwords do not match");

        try {
            setLoading(true);
            await axios.post(
                `${API_BASE_URL}/user/reset-password`,
                { email, password }
            );

            setMsg("Password updated successfully 🎉");
            setError("");
        } catch (err) {
            setError("Password reset failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "auto", paddingTop: "40px" }}>
            <h2>Forgot Password</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {msg && <p style={{ color: "green" }}>{msg}</p>}

            <div ref={sectionRef}>

                {/* 🔹 STEP 1 – EMAIL ONLY */}
                {step === 1 && (
                    <>
                        <h4>Enter Registered Email</h4>
                        <input
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button onClick={sendOtp} disabled={loading}>
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </>
                )}

                {/* 🔹 STEP 2 – OTP ONLY */}
                {step === 2 && (
                    <>
                        <h4>Enter OTP</h4>
                        <input
                            placeholder="6 digit OTP"
                            maxLength={6}
                            value={otp}
                            onChange={(e) =>
                                setOtp(e.target.value.replace(/\D/g, ""))
                            }
                        />
                        <button onClick={verifyOtp} disabled={loading}>
                            Verify OTP
                        </button>
                    </>
                )}

                {/* 🔹 STEP 3 – PASSWORD ONLY */}
                {step === 3 && (
                    <>
                        <h4>Reset Password</h4>
                        <input
                            type="password"
                            placeholder="New Password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            onChange={(e) => setConfirm(e.target.value)}
                        />
                        <button onClick={resetPassword} disabled={loading}>
                            Update Password
                        </button>
                    </>
                )}

            </div>
        </div>
    );
}
