import React from 'react'
import style from './services.module.css'
import Headers from "../../component/utilities/Header/Headers";
import Footer from "../../component/utilities/footer/footer";
import headerImage from "../../assets/headers.jpg";
import Card from '../../component/utilities/card/Card';
import Benifits from '../Home/benifits/Benifits';
import { FaCrown } from 'react-icons/fa';
import {service} from './data'


const Services = () => {
  return (
    <>
      <Headers title="Services" image={headerImage}>
        <p style={{ color: "white" }}>
        </p>
      </Headers>

      <section className={style.benfits}>
        <div className={`${style.container}${style.benfitsContainer}`}>
          <Benifits icons={<FaCrown />} title="Services" />
        
        <div className={style.benfitsWrapper}>
            {/* function for render data from data.jsx */}
          {service.map(({ title, info, id }) => {
            return (
              <Card className={style.programsProgram} key={id}>
                <h4>{title}</h4>
                <p>{info}</p>
              </Card>
            );
          })}
        </div>
        </div>
      </section>
      <Footer/>
    </>
  )
}

export default Services