import React from 'react';
import { NavLink } from 'react-router-dom';
import style from "./forgot.module.css"

const Forgot = () => {
  return (
    <div className={style.midContainer}>
      <div className={style.midLeftContainer}>
        <img src="https://images.pexels.com/photos/5669602/pexels-photo-5669602.jpeg?cs=srgb&dl=pexels-sora-shimazaki-5669602.jpg&fm=jpg" alt="logo2" />
      </div>
      <div className={style.midRightContainer}>
        <div className="container-head">
          <h2>Reset password</h2>
          </div>

        <form className={style.formContainer} action="">
          <input className={style.input} type="email" name="email" placeholder="New Email" required />
          <input className={style.input} type="password" name="password" placeholder=" New password" required />
          <input className={style.input} type="submit" value="Continue" />
        </form>
      </div>
    </div>
  )
}

export default Forgot