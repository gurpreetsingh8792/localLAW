// import style from "./register.module.css";
import React from 'react';
import { NavLink } from 'react-router-dom';

const Register = () => {
  return (
    <div>
      <div className="register-container">
      <div className="left-container">
        <img src="https://images.pexels.com/photos/5669602/pexels-photo-5669602.jpeg?cs=srgb&dl=pexels-sora-shimazaki-5669602.jpg&fm=jpg" alt="logo2" />
      </div>
      <div className="right-container">
        <div className="container-head">
          <h2>Let's Get Started</h2>
          {/* <p>Log in to your account</p> */}
        </div>

        <form className="form-container" action="">
          <input type="text" name="name" placeholder="Your Name" required />
          <input type="text" name="last-name" placeholder="Your Last Name" required />
          <input type="email" name="email" placeholder="Your Email" required />
          <input type="password" name="password" placeholder="Enter password" required />
          <input type="submit" value="Continue" />
          <NavLink className="forgot-pass" to={"/forgot"}>Forgot password?</NavLink>
        </form>
        {/* <small>Already have an account? <a href="register">Sign-up</a></small> */}
      </div>
    </div>
    </div>
  )
}

export default Register