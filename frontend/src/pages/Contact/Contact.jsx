import React, { useState } from "react";
import style from "./contact.module.css";
import Headers from "../../component/utilities/Header/Headers";
import Footer from "../../component/utilities/footer/footer";
import image from "../../assets/contact.jpg";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    setFormData({
      name: "",
      email: "",
      message: "",
    });
  };

  return (
    <>
      <Headers title="Contact Us" image={image}>
        <p style={{ color: "white" }}></p>
      </Headers>
      <div className={style.contactFormContainer}>
        <h1>Contact Us</h1>
        <form onSubmit={handleSubmit}>
          <div className={style.formGroup}>
            <label htmlFor="name">Name</label>
            <input
              className={style.input}
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className={style.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              className={style.input}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className={style.formGroup}>
            <label htmlFor="message">Message</label>
            <textarea
              className={style.input}
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>
          <button type="submit" className={style.submitButton}>
            Submit
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default Contact;
