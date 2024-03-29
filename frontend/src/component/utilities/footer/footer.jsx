import React from "react";
import { Link } from "react-router-dom";
import style from "./footer.module.css";
import { AiFillLinkedin } from "react-icons/ai";
import { AiFillFacebook } from "react-icons/ai";
import { AiFillInstagram } from "react-icons/ai";
import { AiFillYoutube } from "react-icons/ai";
import logo from '../../../assets/MainLogo.png' 

const footer = () => {
  return (
    <footer className={style.MainContainer}>

    <div className={style.LogoContainer}>
    <Link to={"/"} className={style.logo}>
      <img className={style.logo1} src={logo} alt="Logo" />
      <h4>Lawfax</h4>
    </Link>
    </div>

    <div className={style.FooterCopyContainer}>
    <small className={style.footerCopy}>
      2023 Law<span className={style.footerCopy}>Fax</span> &copy; All
      right reserved
    </small>
    </div>

    <div className={style.footerSocial}>
      <a className={style.LinkedIn} href="http://linkedin.com" target="_blank">
        <AiFillLinkedin />
      </a>
      <a className={style.FaceBook} href="http://facebook.com" target="_blank">
        <AiFillFacebook />
      </a>
      <a className={style.InstaGram} href="http://instagram.com" target="_blank">
        <AiFillInstagram />
      </a>
      <a className={style.YouTuber} href="http://youtube.com" target="_blank">
        <AiFillYoutube />
      </a>
    </div>
  </footer>
  
  );
};

export default footer;
