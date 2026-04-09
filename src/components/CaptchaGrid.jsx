import React from 'react';
import { RefreshCw } from 'lucide-react';
import { API_BASE } from '../services/api';

const resolveCaptchaUrl = (url) => {
  if (!url) {
    return '';
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;
};

const CaptchaGrid = ({ challenge, selectedImageIds, onToggle, onRefresh }) => {
  return (
    <div className="captcha-card">
      <div className="captcha-header">
        <div>
          <p className="eyebrow">Image CAPTCHA</p>
          <h3>{challenge?.question || 'Loading CAPTCHA...'}</h3>
        </div>
        <button type="button" className="ghost-button" onClick={onRefresh}>
          <RefreshCw size={16} /> Refresh CAPTCHA
        </button>
      </div>

      <div className="captcha-grid">
        {(challenge?.images || []).map((image) => {
          const selected = selectedImageIds.includes(image.id);
          return (
            <button
              key={image.id}
              type="button"
              className={`captcha-tile ${selected ? 'selected' : ''}`}
              onClick={() => onToggle(image.id)}
            >
              <img src={resolveCaptchaUrl(image.url)} alt="captcha option" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CaptchaGrid;