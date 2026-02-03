import React, { useState } from 'react';
import './SiyerCard.css';

function SiyerCard({ section }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    section_id,
    main_theme,
    pages = [],
    relevant_text
  } = section;

  const pagesStr = pages.length > 0 ? `s. ${pages.join(', ')}` : '';

  return (
    <div className="siyer-card">
      <div className="siyer-card-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="siyer-card-title">
          <span className="siyer-theme">{main_theme}</span>
          <span className="siyer-expand-icon">{isExpanded ? '\u25BC' : '\u25B6'}</span>
        </div>
        <div className="siyer-meta">
          {pagesStr && <span className="siyer-pages-badge">{pagesStr}</span>}
          {section_id && <span className="siyer-id-badge">{section_id}</span>}
        </div>
      </div>

      {isExpanded && relevant_text && (
        <div className="siyer-card-body">
          <div className="siyer-text-section">
            <p>{relevant_text}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SiyerCard;
