import React from "react";
import style from "./home.module.css";
import Header from "../../utilities/header/Header";
import Benifits from "./benifits/Benifits";
import { FaCrown } from "react-icons/fa";
import { benfit } from "./data";
import Card from "../../utilities/card/Card";

const Home = () => {
  return (
    <>
      <Header />
      <section className={style.programs}>
        <div className={`${style.container}${style.programsContainer}`}>
          <Benifits icons={<FaCrown />} title="programs" />
        </div>
        <div className={style.programsWrapper}>
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
      </section>
    </>
  );
};

export default Home;
