import React, { useEffect, useState } from "react";
import axios from "axios";

export default function FacebookPages({ userId }) {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    axios.get(`https://automatedpostingbackend.onrender.com/social/facebook/pages/${userId}`)
      .then(res => setPages(res.data.pages))
      .catch(err => console.error(err));
  }, [userId]);

  return (
    <div>
      <h2>Connected Facebook Pages</h2>
      {pages.length === 0 && <p>No pages connected.</p>}

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {pages.map(page => (
          <div key={page.id} style={{
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "15px",
            margin: "10px",
            width: "300px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
          }}>
            <h3>{page.name}</h3>
            <p>Followers: {page.fan_count}</p>
            <a href={page.link} target="_blank" rel="noreferrer">Visit Page</a>

            <h4>Recent Posts:</h4>
            <ul>
              {page.posts.map(post => (
                <li key={post.id}>
                  {post.message?.slice(0, 100)}...
                  <br />
                  Likes: {post.likes?.summary?.total_count || 0}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
