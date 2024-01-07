import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import styles from './ReviewDocForm.module.css';
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar';
import axios from 'axios';



const ReviewDocForm = () => {
  const initialValues = {
    reviewMethod: '',
    contactMethod: '',
    file: '',
    text: '',
    email: '',
    mobileNo: '',
    paymentId: '',
  };
  const onSubmit = async (values, { resetForm }) => {
    try {
      const response = await axios.post('http://localhost:8052/reviewdocform', values, {
        headers: {
          'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
        },
      });

      console.log(response.data); // Log the response from the backend
      alert('To Review the Doc, Do Payment First');
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };
  
  const validationSchema = Yup.object().shape({
    reviewMethod: Yup.string().required('Please select a review method'),
    contactMethod: Yup.string().required('Please select a contact method'),
    file: Yup.mixed(),
    text: Yup.string(),
    email: Yup.string(),
    mobileNo: Yup.string(),
    paymentId: Yup.string(),
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      alert("You are offline... Failed to load Razorpay SDK");
      return;
    }

    const options = {
      key: 'rzp_test_SJsbPFYVQOtlbi', 
      currency: "INR",
      amount: 100000, 
      name: "Lawfax",
      description: "Payment for Document Review",
      // image: "",
      handler: function (response) {
        const paymentId = response.razorpay_payment_id;
        alert(`Payment Successfully\nPayment ID: $${paymentId}`);
       

        setPaymentSuccess(true);
        formik.setFieldValue('paymentId', paymentId);
      },
      prefill: {
        name: formik.values.name,
        email: formik.values.email,
        contact: formik.values.mobileNo,
      },
      theme: {
        color: '#924a4a'
    }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  

  return (
    <>
      <DashboardNavbar />
      <form onSubmit={formik.handleSubmit}> {/* Wrap the form with <form> tag */}
        <div className={styles.reviewDocForm}>
          <h2 className={styles.heading}>HOW DO YOU WANT TO REVIEW YOUR DOCUMENT</h2>
          <div>
            <label className={styles.label}>
              <input
                type="radio"
                name="reviewMethod"
                value="file"
                checked={formik.values.reviewMethod === 'file'}
                onChange={formik.handleChange}
              />
              File
            </label>
            <label className={styles.label}>
              <input
                type="radio"
                name="reviewMethod"
                value="text"
                checked={formik.values.reviewMethod === 'text'}
                onChange={formik.handleChange}
              />
              Text
            </label>
          </div>
          {formik.values.reviewMethod === 'file' && (
            <div>
              <input
                type="file"
                id="file"
                name="file"
                className={styles.input0}
                onChange={(event) => formik.setFieldValue('file', event.target.files[0])}
              />
              {formik.touched.file && formik.errors.file && (
                <div className={styles.error}>{formik.errors.file}</div>
              )}
            </div>
          )}
          {formik.values.reviewMethod === 'text' && (
            <div>
              <textarea
                id="text"
                name="text"
                placeholder="Place your Doc here"
                className={styles.inputTextarea}
                onChange={formik.handleChange}
                value={formik.values.text}
              />
              {formik.touched.text && formik.errors.text && (
                <div className={styles.error}>{formik.errors.text}</div>
              )}
            </div>
          )}
          <h2 className={styles.heading}>NEED EXPERT ADVICE?</h2>
          <p className={styles.para}>
            We will send you the revised document as soon as possible. Please provide the following
            details so that we can provide you the revised document.
          </p>
          <div>
            <label className={styles.label}>
              <input
                type="radio"
                name="contactMethod"
                value="email"
                checked={formik.values.contactMethod === 'email'}
                onChange={formik.handleChange}
              />
              Email
            </label>
            <label className={styles.label}>
              <input
                type="radio"
                name="contactMethod"
                value="whatsapp"
                checked={formik.values.contactMethod === 'whatsapp'}
                onChange={formik.handleChange}
              />
              WhatsApp
            </label>
          </div>
          {formik.values.contactMethod === 'email' && (
            <div>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your Email Address here"
                className={styles.input}
                onChange={formik.handleChange}
                value={formik.values.email}
              />
              {formik.touched.email && formik.errors.email && (
                <div className={styles.error}>{formik.errors.email}</div>
              )}
            </div>
          )}
          {formik.values.contactMethod === 'whatsapp' && (
            <div>
              <input
                type="text"
                id="mobileNo"
                placeholder="Enter your whatsapp mobile no. here"
                name="mobileNo"
                className={styles.input}
                onChange={formik.handleChange}
                value={formik.values.mobileNo}
              />
              {formik.touched.mobileNo && formik.errors.mobileNo && (
                <div className={styles.error}>{formik.errors.mobileNo}</div>
              )}
            </div>
          )}
          <div>
            <button type="submit" className={styles.submitButton} onClick={handleRazorpayPayment}>
              Submit
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default ReviewDocForm;
