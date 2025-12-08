import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Success() {
  const [pages, setPages] = useState([]);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    // GET userId from localStorage (saved during login)
    const savedUserId = localStorage.getItem("userId");

    if (!savedUserId) {
      console.error("❌ No userId found");
      return;
    }

    setUserId(savedUserId);

    axios
      .get(`https://automatedpostingbackend.onrender.com/social/facebook/pages/${savedUserId}`)
      .then((res) => {
        setPages(res.data.pages);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Connected Facebook Pages</h2>

      {pages.length === 0 && <p>No pages connected.</p>}

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {pages.map((page) => (
          <div
            key={page.providerId}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "15px",
              margin: "10px",
              width: "300px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <h3>{page.meta.name}</h3>
            <p>Category: {page.meta.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
