import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import style from './header.module.css';



const Header = () => {
  
  return (
    <header className={style.mainHeader}>
    
      <div className={`${style.container} ${style.mainHeaderContainers}`}>
        <div className={style.mainHeaderLeft}>
          <h1 style={{fontSize:"3rem", color:"white"}}>Law<span>fax</span> Where Facts Meet the Law</h1>
          <NavLink to={'/DemoRequestForm'} className={style.btn}>
            Request for demo
          </NavLink>
        </div>
        <div className={style.mainHeaderRight}>
          <div className={style.mainHeaderCircle}></div>
          <div className={style.headerImage}>
            
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
