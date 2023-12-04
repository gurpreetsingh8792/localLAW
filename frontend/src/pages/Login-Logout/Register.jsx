import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import style from "./register.module.css";

// Validation schema for form fields
const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const LogIn = () => {
  // Form submission handler
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Post data to the '/register' endpoint
      const response = await axios.post('http://localhost:8052/register', {
        firstname: values.firstname,
        lastname: values.lastname,
        username: values.email,
        password: values.password,
      });
      console.log('User registered:', response.data);
      
      // After successful registration, you might want to reset the form or redirect the user
      resetForm();
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
    } finally {
      setSubmitting(false);
    }
  };

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

        <Formik
          initialValues={{ name: '', lastName: '', email: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className={style.formContainer}>
              <Field className={style.input} type="text" name="name" placeholder="Name" />
              <ErrorMessage name="name" component="div" className={style.error} />

              <Field className={style.input} type="text" name="lastName" placeholder="Last Name" />
              <ErrorMessage name="lastName" component="div" className={style.error} />

              <Field className={style.input} type="email" name="email" placeholder="Your email" />
              <ErrorMessage name="email" component="div" className={style.error} />

              <Field className={style.input} type="password" name="password" placeholder="Password" />
              <ErrorMessage name="password" component="div" className={style.error} />

              <button type="submit" className={style.submit} disabled={isSubmitting}>
                Continue
              </button>
            </Form>
          )}
        </Formik>

        <small>Already have an account? <NavLink className={style.signUp} to={"/register"}>Sign-up</NavLink></small>
      </div>
    </div>
  );
};

export default LogIn;
