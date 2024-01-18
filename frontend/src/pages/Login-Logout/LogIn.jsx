import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import style from './login.module.css';
import { useAuth } from './AuthContext';
import { Visibility, VisibilityOff } from '@mui/icons-material';
// Validation schema using Yup
const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required')
});

const LogIn = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleLogin = async (values, actions) => {
    try {
      const response = await axios.post('http://localhost:8052/login', {
        username: values.email,
        password: values.password
      });
      localStorage.setItem('token', response.data.token);
      login(response.data.token);
      navigate('/dashboard');
    } catch (error) {
      if (error.response) {
        console.error('Login failed:', error.response.data.error);
        // You can perform some error handling here, for example:
        actions.setFieldError('general', 'Login failed: ' + error.response.data.error);
      } else {
        console.error('Login Error:', error.message);
      }
      actions.setSubmitting(false);
    }
  };

  return (
    <div className={style.midContainer}>
      <div className={style.midLeftContainer}>
        <img src="https://images.pexels.com/photos/5669602/pexels-photo-5669602.jpeg?cs=srgb&dl=pexels-sora-shimazaki-5669602.jpg&fm=jpg" alt="logo2" />
      </div>
      <div className={style.midRightContainer}>
        <div className="container-head">
          <h2>LawFax</h2>
          <p>Log in to your account</p>
        </div>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting, errors }) => (
            <Form className={style.formContainer}>
              <Field
                className={style.input}
                type="email"
                name="email"
                placeholder="What is your email?"
              />
              <ErrorMessage name="email" component="div" className={style.error} />
              <div className={style.inputContainer}>
              <Field
              className={`${style.input} ${style.passwordInput}`}
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              
            />
            <button
              type="button"
              className={style.visibilityButton}
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </button>
            </div>
       
      
              <ErrorMessage  name = "password" component="div" className={style.error} />

              <button className={style.submit} type="submit" disabled={isSubmitting}>
                Continue
              </button>

              {errors.general && <div className={style.error}>{errors.general}</div>}

              <NavLink className={style.forgotPass} to={"/forgot"}>Forgot password?</NavLink>
            </Form>
          )}
        </Formik>

        <small>Don't have an account? <NavLink className={style.signUp} to={"/register"}>Sign-up</NavLink></small>
      </div>
    </div>
  );
};

export default LogIn;
