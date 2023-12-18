import React from "react";
import Headers from "../../component/utilities/Header/Headers";
import Footer from "../../component/utilities/footer/footer";
import image from "../../assets/dashboard.jpg";
import { NavLink } from "react-router-dom";
import SideNav from "../../component/utilities/SideNavBar/SideNav";
// import Tile from './tile/Tile'
import style from "./dashboard.module.css";
// import { BsFillBriefcaseFill } from "react-icons/bs";
import Card from "../../component/utilities/card/Card";
import { data } from "./data";
import { AiOutlineSearch } from "react-icons/ai";
import DashboardNavbar from "../../component/utilities/DashboardNavbar/DashboardNavbar";

const DashBoard = () => {
  return (
    <>
      {/* <SideNav/> */}
      {/* <Headers title="Dashboard" image={image}>
        <p style={{ color: "white" }}>
        </p>
      </Headers> */}
      <DashboardNavbar />
      <h2 className={style.head}>
        <NavLink className={style.heading} to={"/explore"}>
          <button className={style.btn}>
            <AiOutlineSearch className={style.SearchLogo} />
            Quickly search cases by name or number
          </button>
        </NavLink>
      </h2>
      <div className={style.benfitsWrapper}>
        {/* function for render data from data.jsx */}
        {data.map(
          ({
            id,
            icon,
            title,
            info,
            caseNo,
            plusIcon,
            pathAdd,
            pathView,
            plusIcon2,
            addBill,
            addInvoice,
            details,
          }) => {
            return (
              <Card
                className={style.programsProgram}
                key={id}
                details={details}
              >
                <span>{icon}</span>
                <h4>{caseNo}</h4>
                <NavLink to={pathAdd}>
                  <h4 className={style.btnAdd1}>
                    {addBill}
                    {plusIcon}{" "}
                  </h4>
                </NavLink>
                <NavLink to={pathAdd}>
                  <h4 className={style.btnAdd1}>
                    {addInvoice}
                    {plusIcon2}{" "}
                  </h4>
                </NavLink>

                <div className={style.addButtonsContainer}></div>
                <h4>{title}</h4>
                <NavLink to={pathView}>
                  <button className={style.btn}>{info}</button>
                </NavLink>
              </Card>
            );
          }
        )}
      </div>

      <Footer />
    </>
  );
};

export default DashBoard;
