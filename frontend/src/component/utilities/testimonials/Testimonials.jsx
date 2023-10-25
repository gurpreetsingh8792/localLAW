import React from 'react'
import style from './testimonials.module.css'
import Card from '../card/Card'
import { testimonials } from './data'
import Benifits from '../../../pages/Home/benifits/Benifits'
import { FaCrown } from 'react-icons/fa'
import { useState } from 'react'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { BsArrowRightCircle } from 'react-icons/bs';




const Testimonials = () => {
  
  const [index, setIndex] = useState(0);
  const {name, job, info, avatar} = testimonials[index];

  const nextTestimonialHandler = () => {
    setIndex(prev => prev+1);
    if(index >= testimonials.length-1){
      setIndex(0)
    }
  };

  const prevTestimonialHandler = () => {
    setIndex(prev => prev-1);

    if(index <= 0){
      setIndex(testimonials.length-1)
    }
  };



  return (
    <section className={style.testimonials}>
      <div className={`${style.container}, ${style.testimonialContainer}`}></div>
      <Benifits icons={<FaCrown />} title="Testimonial" className={style.testimonialsHead}></Benifits>
      <Card className={style.testimonial}>
          <div className={style.testimonialAvatar}>
            <img src={avatar} alt={name}/>
          </div>
          
          <p className={style.testimonialInfo}>{`"${info}"`}</p>
          <h5>{name}</h5>
          <p className={style.testimonialTitle}>{job}</p>
          
      </Card>
      <div className={style.testimonialBtnContainer}>
        <button className={style.testimonialsBtn} onClick={prevTestimonialHandler}><BsArrowLeftCircle/></button>
        <button className={style.testimonialsBtn} onClick={nextTestimonialHandler}><BsArrowRightCircle/></button>
      </div>
    </section>
  )
}

export default Testimonials