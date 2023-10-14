import React from "react";
// import {FaCrown} from 'react-icons/fa'
import style from "./benfits.module.css";

const Benifits = ({ icons, title, className }) => {
  return (
    <div className={`${style.sectionHead} ${className}`}>
      <span style={{fontSize:"1.5rem"}}>{icons}</span>
      <h2 style={{fontSize:"2.5rem"}}>Benfits</h2>
    </div>
  );
};

export default Benifits;
