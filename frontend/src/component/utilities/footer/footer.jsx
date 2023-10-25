import React from "react";
import { Link } from "react-router-dom";
import style from "./footer.module.css";
import { AiFillLinkedin } from "react-icons/ai";
import { AiFillFacebook } from "react-icons/ai";
import { AiFillInstagram } from "react-icons/ai";
import { AiFillYoutube } from "react-icons/ai";

const footer = () => {
  return (
      <footer>
        <div className={`${style.container}, ${style.footerContainer}`}>
          <article>
            <Link to={"/"} className={style.logo}>
              <img src="" alt="Logo" />
            </Link>
            <p>
              Filler text is text that shares some characteristics of a real
              written text, but is random or otherwise generated.
            </p>
            <div className={style.footerSocial}>
              <a href="http://linkedin.com" target="_blank">
                <AiFillLinkedin />
              </a>
              <a href="http://facebook.com" target="_blank">
                <AiFillFacebook />
              </a>
              <a href="http://instagram.com" target="_blank">
                <AiFillInstagram />
              </a>
              <a href="http://youtube.com" target="_blank">
                <AiFillYoutube />
              </a>
            </div>
          </article>
          <article>
            <h4>Permalinks</h4>
            <Link to={"/about"}>About</Link>
            <Link to={"/dashboard"}>Dashboard</Link>
            <Link to={"/services"}>Service</Link>
            <Link to={"/contact"}>Contact Us</Link>
            {/* <Link to={'/about'}></Link> */}
          </article>
          <article>
            <h4>Permalinks</h4>
            <Link to={"/about"}>About</Link>
            <Link to={"/dashboard"}>Dashboard</Link>
            <Link to={"/services"}>Service</Link>
            <Link to={"/contact"}>Contact Us</Link>
            {/* <Link to={'/about'}></Link> */}
          </article>
          <article>
            <h4>Permalinks</h4>
            <Link to={"/about"}>About</Link>
            <Link to={"/dashboard"}>Dashboard</Link>
            <Link to={"/services"}>Service</Link>
            <Link to={"/contact"}>Contact Us</Link>
            {/* <Link to={'/about'}></Link> */}
          </article>
        </div>
        <div className={style.footerCopyright}>
          <small>
            2023 Law<span className={style.footerCopy}>fax</span> &copy; All
            right reserved
          </small>
        </div>
    </footer>
  );
};

export default footer;
