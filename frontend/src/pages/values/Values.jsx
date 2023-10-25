import React from "react";
import style from "./values.module.css";
import { value } from "./data";
import Card from "../../component/utilities/card/Card";
import Image from "../../assets/value.jpg";
import Benifits from "../Home/benifits/Benifits";
import { FaCrown } from "react-icons/fa";

const Values = () => {
  return (
    <section className={style.values}>
        <div className={`${style.container}, ${style.valuesContainer}`}>
                <div className={style.valuesLeft}>
                <div className={style.valuseImage}>
                    <img src={Image} alt=""/>
                </div>
                </div>
                <div className={style.valuesRight}>
                <Benifits icons={<FaCrown />} title="Values" />
                <p>
                    Filler text is text that shares some characteristics of a real
                    written text, but is random or otherwise generated.
                </p>
                <div className={style.valueWrapper}>
                    {value.map(({ id, icon, title, info }) => {
                    return (
                        <Card className={style.valuesValue} key={id}>
                        <span>{icon}</span>
                        <h4>{title}</h4>
                        <p>{info}</p>
                        </Card>
                    );
                    })}
                </div>
                </div>
        </div>
    </section>
  );
};

export default Values;
