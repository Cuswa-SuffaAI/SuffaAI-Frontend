import React, { useState } from 'react';
import './HadithCard.css';

function HadithCard({ hadith }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    hadith_number,
    narrator,
    sources = [],
    turkish_text,
    arabic_text
  } = hadith;

  return (
    <div className="hadith-card">
      <div className="hadith-card-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="hadith-card-title">
          <span className="hadith-number">#{hadith_number}</span>
          <span className="hadith-expand-icon">{isExpanded ? '▼' : '▶'}</span>
        </div>
        <div className="hadith-sources">
          {sources.map((source, idx) => (
            <span key={idx} className="source-badge">{source}</span>
          ))}
        </div>
      </div>

      {isExpanded && (
        <div className="hadith-card-body">
          {narrator && (
            <div className="hadith-narrator">
              <span className="narrator-label">Ravi:</span>
              <span className="narrator-name">{narrator}</span>
            </div>
          )}

          <div className="hadith-text-section">
            <div className="hadith-text turkish">
              <div className="text-label">Türkçe</div>
              <p>{turkish_text}</p>
            </div>

            {arabic_text && (
              <div className="hadith-text arabic">
                <div className="text-label">Arapça</div>
                <p dir="rtl">{arabic_text}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HadithCard;
