import React from "react";
import style from "./header.module.css";


const Headers = ({ title, image, children }) => {
  return (
    <header className={style.header}>
      <div className={style.HeaderContainer}>
        <div className={style.headerContainerBg}>
          <img src={image} alt="Header background Image" />
        </div>
        <div className={style.headerContent}>
          <h2>{title}</h2>
          <small>{children}</small>
        </div>
      </div>
    </header>
  );
};

export default Headers;
