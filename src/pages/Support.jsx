import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

// 🔹 Import your existing components
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const Support = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });
    const [sidebarWidth, setSidebarWidth] = useState(50);
    const [responseMsg, setResponseMsg] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch("https://automatedpostingbackend-h9dc.onrender.com/user/support", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await res.json();
        setResponseMsg(data.msg);

        if (data.success) {
            setFormData({
                name: "",
                email: "",
                phone: "",
                subject: "",
                message: ""
            });
        }
    };

    return (
        <>
            <Navbar />

            <Sidebar onWidthChange={setSidebarWidth} />
            <main
                style={{
                    ...styles.content,
                    marginLeft: sidebarWidth,
                    marginTop: 60,
                    transition: "0.3s ease",
                    padding: "18px 32px",
                }}
            >

                <div className="d-flex">

                    {/* 🔹 MAIN CONTENT */}
                    <div className="container-fluid p-4">

                        {/* CONTACT INFO */}
                        <div className="row text-center mb-4">
                            <div className="col-md-4 mb-3">
                                <div style={styles.infoCard}>
                                    <h6 style={styles.heading}>Email</h6>
                                    <p className="mb-0">support@yourdomain.com</p>
                                </div>
                            </div>
                            <div className="col-md-4 mb-3">
                                <div style={styles.infoCard}>
                                    <h6 style={styles.heading}>Phone</h6>
                                    <p className="mb-0">+91-7997558833</p>
                                </div>
                            </div>
                            <div className="col-md-4 mb-3">
                                <div style={styles.infoCard}>
                                    <h6 style={styles.heading}>Location</h6>
                                    <p className="mb-0">Hyderabad, India</p>
                                </div>
                            </div>
                        </div>

                        {/* SUPPORT FORM */}
                        <div className="row justify-content-center">
                            <div className="col-lg-12">
                                <div style={styles.formCard}>
                                    <h4 className="text-center mb-2">Contact Support</h4>
                                    <p className="text-center text-muted mb-4">
                                        Facing an issue? Our team will help you.
                                    </p>

                                    {responseMsg && (
                                        <div className="alert alert-info text-center">
                                            {responseMsg}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    className="form-control"
                                                    placeholder="Your Name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <input
                                                    type="email"
                                                    name="email"
                                                    className="form-control"
                                                    placeholder="Your Email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <input
                                                type="text"
                                                name="phone"
                                                className="form-control"
                                                placeholder="Phone Number"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <select
                                                name="subject"
                                                className="form-select"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select Issue</option>
                                                <option>Connection Problem</option>
                                                <option>Account Problems</option>
                                                <option>Postings Problem</option>
                                                <option>Plans</option>
                                                <option>Features</option>
                                                <option>Registration or Login</option>
                                                <option>Others</option>
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <textarea
                                                name="message"
                                                rows="4"
                                                className="form-control"
                                                placeholder="Describe your issue"
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            style={styles.button}
                                            className="btn w-100"
                                        >
                                            Submit Request
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main >

            <Footer />
        </>
    );
};

export default Support;

/* 🎨 INLINE STYLES (NO BACKGROUND COLOR) */
const styles = {
    infoCard: {
        background: "#fff",
        padding: "18px",
        borderRadius: "10px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.12)"
    },
    heading: {
        color: "rgb(124, 58, 237)",
        fontWeight: "600"
    },
    formCard: {
        background: "#fff",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.18)"
    },
    button: {
        background:
            "linear-gradient(135deg, rgb(124, 58, 237), rgb(236, 72, 153))",
        border: "none",
        color: "#fff",
        padding: "12px",
        fontWeight: "600",
        borderRadius: "8px"
    }
};
