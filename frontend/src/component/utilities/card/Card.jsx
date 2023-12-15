import React from 'react';
import style from './card.module.css';

const Card = ({ className, children, details }) => {
  const [showDetails, setShowDetails] = React.useState(false);

  const handleMouseEnter = () => {
    setShowDetails(true);
  };

  const handleMouseLeave = () => {
    setShowDetails(false);
  };

  return (
    <article
      className={`${style.card} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {showDetails && (
        <div className={style.detailsOverlay}>
          <p className={style.detailsText}>{details}</p>
        </div>
      )}
    </article>
  );
};

export default Card;
