import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Pricing = () => {
    const [sidebarWidth, setSidebarWidth] = useState(50);

    const getUserFromToken = () => {
        const token = localStorage.getItem("token");
        console.log("Token from localStorage:", token); // ✅ check if token exists

        if (!token) return null;

        try {
            const decoded = jwtDecode(token);
            console.log("Decoded token:", decoded); // ✅ check decoded payload
            return decoded;
        } catch (err) {
            console.log("Invalid token", err);
            return null;
        }
    };

    const handlePayment = async (plan) => {
        const user = getUserFromToken();
        if (!user || !user.id) return alert("User not logged in!");

        const amount = plan === "PRO" ? 999 : plan === "ENTERPRISE" ? 1999 : 0;
        if (!amount) return alert("Free plan");

        try {
            // 1️⃣ Create order
            const { data } = await axios.post(
                "https://automatedpostingbackend-h9dc.onrender.com/payment/create-order",
                {
                    plan,
                    userId: user.id,
                    customerName: user.name,
                    customerEmail: user.email,
                    customerPhone: "9876543210",
                }
            );

            console.log("Cashfree order response:", data);

            if (!data.paymentSessionId) return alert("Payment session missing");

            if (!window.Cashfree) {
                console.error("❌ Cashfree SDK not loaded");
                return alert("Payment SDK not loaded. Refresh page.");
            }

            // 2️⃣ Initialize Cashfree
            const cashfree = window.Cashfree({mode: "production",});

            // 3️⃣ Store orderId for verification
            const orderId = data.orderId;

            // 4️⃣ Checkout
            cashfree
                .checkout({
                    paymentSessionId: data.paymentSessionId,
                    redirectTarget: "_modal",
                })
                .then(async (result) => {
                    console.log("💳 Payment result:", result);

                    if (result.error) {
                        alert("Payment failed or cancelled");
                        return;
                    }

                    // 5️⃣ MANUAL CALLBACK – verify payment status
                    console.log("✅ SUCCESS ORDER ID (stored):", orderId);

                    try {
                        const verify = await axios.post(
                            "https://automatedpostingbackend-h9dc.onrender.com/payment/callback",
                            { orderId }
                        );

                        if (verify.data.success) {
                            alert("Payment successful 🎉 Plan activated!");
                        } else {
                            alert("Payment verification failed!");
                        }
                    } catch (err) {
                        console.error("Payment verification error:", err.response?.data || err.message);
                        alert("Payment verification failed!");
                    }
                });
        } catch (err) {
            console.error(err.response?.data || err.message);
            alert("Payment initiation failed!");
        }
    };

    return (
        <>
            <Navbar />

            <div className="d-flex">
                {/* SIDEBAR */}
                <Sidebar onWidthChange={setSidebarWidth} />

                {/* CONTENT */}
                <div
                    className="pricing-wrapper p-4"
                    style={{
                        marginLeft: sidebarWidth,
                        width: `calc(100% - ${sidebarWidth}px)`
                    }}
                >
                    {/* HEADER */}
                    <div className="text-center mb-5 pricing-header">
                        <h3 className="fw-bold">Grow Faster with SocialSync AI</h3>
                        <p className="text-muted">
                            Automate posting, scheduling, insights & lead generation in one platform
                        </p>
                    </div>

                    <div className="row g-4 justify-content-center">

                        {/* FREE */}
                        <div className="col-lg-4 col-md-6">
                            <div className="pricing-card h-100">
                                <span className="plan-label">FREE</span>
                                <h4 className="plan-name">Starter</h4>

                                <h2 className="price">
                                    ₹0 <span>/ 7 Days</span>
                                </h2>

                                <ul className="features">
                                    <li>Scheduling (All Platforms)</li>
                                    <li>AI Assistance</li>
                                    <li>Manual Posting</li>
                                    <li>Individual Platform Posting</li>
                                    <li className="disabled">Auto Posting</li>
                                    <li className="disabled">Automation</li>
                                    <li className="disabled">Analytics & Metrics</li>
                                    <li className="disabled">Leads</li>
                                    <li className="disabled">Team / Agency Access</li>
                                    <li className="disabled">Priority Support</li>

                                </ul>

                                <button className="btn btn-outline-brand w-100">
                                    Start Free Trial
                                </button>
                            </div>
                        </div>

                        {/* PRO */}
                        <div className="col-lg-4 col-md-6">
                            <div className="pricing-card popular h-100">
                                <span className="popular-badge">Most Popular</span>
                                <span className="plan-label highlight-text">PRO</span>
                                <h4 className="plan-name">Professional</h4>

                                <h2 className="price highlight">
                                    ₹999 <span>/ month</span>
                                </h2>

                                <ul className="features">
                                    <li>Scheduling</li>
                                    <li>Auto Posting</li>
                                    <li>Automation</li>
                                    <li>Post to 3 Platforms at Once</li>
                                    <li>Automation for 3 Accounts</li>
                                    <li>AI Assistance</li>
                                    <li className="disabled">Analytics & Metrics</li>
                                    <li className="disabled">Leads</li>
                                    <li className="disabled">Team / Agency Access</li>
                                    <li className="disabled">Priority Support</li>

                                </ul>

                                <button
                                    className="btn btn-brand w-100"
                                    onClick={() => handlePayment("PRO")}
                                >
                                    Upgrade to Pro
                                </button>
                            </div>
                        </div>

                        {/* ENTERPRISE */}
                        <div className="col-lg-4 col-md-6">
                            <div className="pricing-card enterprise h-100">
                                <span className="plan-label enterprise-text">ENTERPRISE</span>
                                <h4 className="plan-name">Ultimate</h4>

                                <h2 className="price highlight">
                                    ₹1999 <span>/ month</span>
                                </h2>

                                <ul className="features">
                                    <li>Scheduling</li>
                                    <li>Auto Posting</li>
                                    <li>Full Automation</li>
                                    <li>Post to ALL Platforms at Once</li>
                                    <li>Unlimited Accounts</li>
                                    <li>Advanced AI Assistance</li>
                                    <li>Analytics & Metrics</li>
                                    <li>Leads Management</li>
                                    <li>Team / Agency Access</li>
                                    <li>Priority Support</li>
                                </ul>

                                <button
                                    className="btn btn-outline-enterprise w-100"
                                    onClick={() => handlePayment("ENTERPRISE")}
                                >
                                    Upgrade to Enterprise
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <Footer />

            {/* ===== SINGLE PAGE CSS ===== */}
            <style>{`
                body {
                    background: #f8fafc;
                }

                .pricing-wrapper {
                    margin-top: 70px;
                    background: #f8fafc;
                    min-height: calc(100vh - 70px);
                     transition: margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .pricing-header {
                    max-width: 900px;
                    margin: auto;
                }

                .pricing-card {
                    background: #ffffff;
                    border-radius: 20px;
                    padding: 36px 30px;
                    border: 1px solid #e5e7eb;
                    box-shadow: 0 18px 40px rgba(0,0,0,0.08);
                    transition: all 0.35s ease;
                    position: relative;
                }

                .pricing-card:hover {
                    transform: translateY(-12px) scale(1.01);
                }

                .plan-label {
                    display: inline-block;
                    font-size: 12px;
                    font-weight: 700;
                    padding: 4px 12px;
                    border-radius: 20px;
                    background: #f1f5f9;
                    color: #6b7280;
                }

                .plan-name {
                    font-weight: 800;
                    margin: 12px 0;
                }

                .price {
                    font-size: 34px;
                    font-weight: 800;
                    color: rgb(124, 58, 237);
                }

                .price span {
                    font-size: 14px;
                    color: #6b7280;
                }

                .highlight {
                    color: rgb(236, 72, 153);
                }

                .highlight-text {
                    color: rgb(236, 72, 153);
                }

                .enterprise {
                    background: linear-gradient(180deg, #ffffff 0%, #fff1f8 100%);
                    border: 2px solid rgb(236, 72, 153);
                }

                .enterprise-text,
                .enterprise-price {
                    color: rgb(236, 72, 153);
                }

                .features {
                    list-style: none;
                    padding: 0;
                    margin: 28px 0;
                }

                .features li {
                    margin-bottom: 12px;
                    font-size: 14px;
                    color: #374151;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .features li::before {
                    content: "✔";
                    color: rgb(124, 58, 237);
                    font-weight: bold;
                }

                .features .disabled {
                    color: #9ca3af;
                    text-decoration: line-through;
                }

                .features .disabled::before {
                    content: "✖";
                    color: #9ca3af;
                }

                .popular {
                    border: 2px solid rgb(124, 58, 237);
                }

                .popular-badge {
                    position: absolute;
                    top: -14px;
                    right: 20px;
                    background: linear-gradient(
                        90deg,
                        rgb(124, 58, 237),
                        rgb(236, 72, 153)
                    );
                    color: white;
                    padding: 6px 16px;
                    font-size: 12px;
                    border-radius: 20px;
                    font-weight: 600;
                    box-shadow: 0 10px 25px rgba(124, 58, 237, 0.35);
                }

                .btn-brand {
                    background: linear-gradient(
                        90deg,
                        rgb(124, 58, 237),
                        rgb(236, 72, 153)
                    );
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: 12px;
                    font-weight: 600;
                }

                .btn-outline-brand {
                    border: 1px solid rgb(124, 58, 237);
                    color: rgb(124, 58, 237);
                    padding: 12px;
                    border-radius: 12px;
                    font-weight: 600;
                }

                .btn-outline-enterprise {
                    border: 1px solid rgb(236, 72, 153);
                    color: rgb(236, 72, 153);
                    padding: 12px;
                    border-radius: 12px;
                    font-weight: 600;
                }

                .btn-outline-brand:hover {
                    background: rgb(124, 58, 237);
                    color: #fff;
                }

                .btn-outline-enterprise:hover {
                    background: rgb(236, 72, 153);
                    color: #fff;
                }

                @media (max-width: 768px) {
                    .pricing-wrapper {
                        margin-left: 0 !important;
                        width: 100% !important;
                    }
                }
            `}</style>
        </>
    );
};

export default Pricing;