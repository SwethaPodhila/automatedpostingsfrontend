import React, { useEffect, useState } from "react";
import axios from "axios";

export default function FacebookDashboard() {
    const [pages, setPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState("");

    const [message, setMessage] = useState("");
    const [aiPrompt, setAiPrompt] = useState("");
    const [imageFile, setImageFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [responseMsg, setResponseMsg] = useState("");

    // Fetch pages on mount
    useEffect(() => {
        const savedUserId = localStorage.getItem("userId");
        if (!savedUserId) return;

        axios
            .get(`https://automatedpostingbackend.onrender.com/social/pages/${savedUserId}`)
            .then((res) => setPages(res.data.pages))
            .catch((err) => console.error(err));
    }, []);

    // Auto-select first page
    useEffect(() => {
        if (pages.length > 0) {
            const firstPageId = pages[0].providerId;
            setSelectedPage(firstPageId);
        }
    }, [pages]);

    // --- AI Caption Generator ---
    const handleGenerateAI = async () => {
        if (!aiPrompt.trim()) {
            alert("Please enter an AI prompt!");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post("https://automatedpostingbackend.onrender.com/social/ai-generate", {
                prompt: aiPrompt,
            });

            if (res.data.text) {
                setMessage(res.data.text); // auto-fill caption
                setResponseMsg("✨ AI Caption Generated!");
            }
        } catch (err) {
            console.error(err);
            setResponseMsg("❌ AI failed to generate caption.");
        }

        setLoading(false);
    };

    const handlePageSelect = (pageId) => setSelectedPage(pageId);

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) setImageFile(e.target.files[0]);
        else setImageFile(null);
    };

    const handlePost = async () => {
        if (!selectedPage) return alert("Select a page first!");
        if (!message.trim() && !imageFile) return alert("Message or image required!");

        setLoading(true);
        setResponseMsg("");

        try {
            const formData = new FormData();
            formData.append("pageId", selectedPage);
            formData.append("message", message);
            if (imageFile) formData.append("image", imageFile);
            if (aiPrompt) formData.append("aiPrompt", aiPrompt);

            const res = await axios.post(
                "https://automatedpostingbackend.onrender.com/social/publish/facebook",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (res.data.success) {
                setResponseMsg("🎉 Post published successfully!");
                setMessage("");
                setImageFile(null);
                setAiPrompt("");
            } else {
                setResponseMsg("❌ Failed to publish post.");
            }
        } catch (err) {
            console.error(err);
            setResponseMsg("❌ Error publishing post.");
        }

        setLoading(false);
    };

    return (
        <div style={styles.page}>
            <h1 style={styles.heading}>Facebook Page Dashboard</h1>

            {/* Select Page */}
            <div style={styles.section}>
                <label style={styles.label}>Select Page</label>
                <select
                    value={selectedPage}
                    onChange={(e) => handlePageSelect(e.target.value)}
                    style={styles.dropdown}
                >
                    {pages.map((page) => (
                        <option key={page.providerId} value={page.providerId}>
                            {page.meta?.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Message */}
            <div style={styles.section}>
                <h2>📤 Publish to Facebook</h2>
                <textarea
                    placeholder="Write your post here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="4"
                    style={styles.textarea}
                />
            </div>

            {/* AI Prompt */}
            <div style={styles.section}>
                <label style={styles.label}>💡 AI Assist Prompt (Optional)</label>
                <input
                    type="text"
                    placeholder="Give instructions for AI content"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    style={styles.input}
                />

                {/* ⭐ AI Generate Button */}
                <button
                    onClick={handleGenerateAI}
                    disabled={loading}
                    style={{ ...styles.button, background: "#6f42c1" }}
                >
                    ✨ Generate Caption with AI
                </button>
            </div>

            {/* Image Upload */}
            <div style={styles.section}>
                <label style={styles.label}>📷 Upload Image (Optional)</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {imageFile && <p>Selected: {imageFile.name}</p>}
            </div>

            {/* Publish Button */}
            <div style={styles.section}>
                <button onClick={handlePost} disabled={loading} style={styles.button}>
                    {loading ? "🚀 Posting..." : "Publish"}
                </button>
                {responseMsg && <p style={styles.response}>{responseMsg}</p>}
            </div>
        </div>
    );
}

const styles = {
    page: { padding: "30px", fontFamily: "Arial", maxWidth: "700px", margin: "auto" },
    heading: { marginBottom: "25px", textAlign: "center" },
    section: { marginBottom: "20px", display: "flex", flexDirection: "column", gap: "10px" },
    label: { fontSize: "16px", fontWeight: "bold" },
    dropdown: { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ccc" },
    textarea: { width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid #ccc", fontSize: "16px" },
    input: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "14px" },
    button: {
        padding: "12px",
        background: "#1877f2",
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "16px",
    },
    response: { marginTop: "10px", fontWeight: "bold", fontSize: "15px" },
};
