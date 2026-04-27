import React from "react";

const BACKEND_URL = "https://fsad-erp-backend-2.onrender.com";

const CaptchaGrid = ({ challenge, selectedImageIds, onToggle, onRefresh }) => {
  if (!challenge || !challenge.images) {
    return <div>Loading CAPTCHA...</div>;
  }

  return (
    <div className="captcha-box">
      <p><strong>{challenge.question}</strong></p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {challenge.images.map((img) => (
          <img
            key={img.id}
            src={`${BACKEND_URL}${img.url}`}
            alt="captcha"
            onClick={() => onToggle(img.id)}
            style={{
              width: "100%",
              cursor: "pointer",
              border: selectedImageIds.includes(img.id)
                ? "3px solid green"
                : "2px solid #ccc",
              borderRadius: 8,
            }}
          />
        ))}
      </div>

      <button type="button" onClick={onRefresh} style={{ marginTop: 10 }}>
        Refresh CAPTCHA
      </button>
    </div>
  );
};

export default CaptchaGrid;