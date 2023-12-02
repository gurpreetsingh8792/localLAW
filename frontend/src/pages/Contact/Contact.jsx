import React, { useState } from "react";
import emailjs from "emailjs-com";
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(false);
    setSubmitError("");

    emailjs
      .sendForm(
        "service_fay8o8p",
        "template_d2euhz7",
        "#contact-form",
        "90GKjDPQx8XpRzcXr"
      )
      .then(
        (result) => {
          console.log("Email sent successfully:", result.text);
          setFormData({
            name: "",
            email: "",
            message: "",
          });
          setIsSubmitted(true);
        },
        (error) => {
          console.error("Email sending failed:", error);
          setSubmitError("Failed to send message. Please try again later.");
        }
      );
  };

  return (
    <>
      <Headers title="Contact Us" image={image}>
        <p style={{ color: "white" }}></p>
      </Headers>
      <div className={style.contactFormContainer}>
        <h1>Contact Us</h1>
        {isSubmitted && (
          <p className={style.successMessage}>Your message has been sent successfully!</p>
        )}
        {submitError && <p className={style.errorMessage}>{submitError}</p>}
        <form id="contact-form" onSubmit={handleSubmit}>
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
