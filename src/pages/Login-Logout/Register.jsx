import style from "./register.module.css";
import React from 'react';
import { NavLink } from 'react-router-dom';


const LogIn = () => {
  return (
    
       <div className={style.midContainer}>
      <div className={style.midLeftContainer}>
        <img src="https://images.pexels.com/photos/5669602/pexels-photo-5669602.jpeg?cs=srgb&dl=pexels-sora-shimazaki-5669602.jpg&fm=jpg" alt="logo2" />
      </div>
      <div className={style.midRightContainer}>
        <div className="container-head">
          <h2>Let's Get Started</h2>
          <p>Create your account</p>
        </div>

        <form className={style.formContainer} action="">
          <input className={style.input} type="text" name="name" placeholder="Name" required />
          <input className={style.input} type="text" name="lastName" placeholder="Last Name" required />
          <input className={style.input} type="email" name="email" placeholder="Your email" required />
          <input className={style.input} type="password" name="password" placeholder="Password" required />
          <input className={style.input} type="submit" value="Continue" />
          {/* <NavLink className={style.forgotPass} to={"/forgot"}>Forgot password?</NavLink> */}
        </form>
        <small>Already have an account? <NavLink className={style.signUp} to={"/register"}>Sign-up</NavLink></small>
      </div>
    </div>

    
  )
}

export default LogIn