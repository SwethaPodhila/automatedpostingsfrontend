import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

export default function InstagramSuccess() {
    const [metrics, setMetrics] = useState(null);
    const location = useLocation();
    const username = new URLSearchParams(location.search).get("user");

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await axios.get(
                    `https://automatedpostingbackend.onrender.com/social/instagram/metrics?username=${username}`,
                    { withCredentials: true }
                );
                setMetrics(res.data);
            } catch (err) {
                console.error("Fetch metrics error:", err);
            }
        };
        fetchMetrics();
    }, [username]);

    if (!metrics) return <p>Loading metrics...</p>;

    return (
        <div>
            <h2>Instagram Connected Successfully!</h2>
            <p>Username: {metrics.username}</p>
            <p>Followers: {metrics.followers}</p>
            <p>Media Count: {metrics.media_count}</p>
            {/* Add more metrics as needed */}
        </div>
    );
}
