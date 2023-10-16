import React from "react";
import style from "./home.module.css";
import Header from "../../utilities/header/Header";
import Benifits from "./benifits/Benifits";
import { FaCrown } from "react-icons/fa";
import { benfit } from "./data";
import Card from "../../utilities/card/Card";
import Values from "../values/Values";
import Testimonials from "../../utilities/testimonials/Testimonials";
import Footer from "../../utilities/footer/footer";

const Home = () => {
  return (
    <>
      <Header />
      <section className={style.benfits}>
        <div className={`${style.container}${style.benfitsContainer}`}>
          <Benifits icons={<FaCrown />} title="Benfits" />
        
        <div className={style.benfitsWrapper}>
            {/* function for render data from data.jsx */}
          {benfit.map(({ id, icon, title, info, path }) => {
            return (
              <Card className={style.programsProgram} key={id}>
                <span>{icon}</span>
                <h4>{title}</h4>
                <p>{info}</p>
              </Card>
            );
          })}
        </div>
        </div>
      </section>
      <Values/>
      <Testimonials/>
      <Footer/>
      
    </>
  );
};

export default Home;
