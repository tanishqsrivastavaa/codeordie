import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="logo-container">
      <div className="logo-text">
        <span className="logo-bracket">&lt;</span>
        <span className="logo-name">broski</span>
        <span className="logo-bracket">/&gt;</span>
      </div>
      <div className="logo-subtitle">your nonchalant navigator</div>
    </div>
  );
};

export default Logo; 