import React from 'react';
import emailjs from 'emailjs-com';
import style from './DemoRequestForm.module.css';

const DemoRequestForm = () => {

    // first fucntion
    const sendEmail = (formData) => {
      emailjs.send(
        'service_sdnu1i9', // Replace with your email service ID
        'template_b5ybwbc', // Replace with your email template ID
        formData, // Form data to send in the email
        '90GKjDPQx8XpRzcXr' // Replace with your user ID
      )
        .then((response) => {
          console.log('Email sent successfully:', response);
          // You can handle success, such as showing a success message to the user
        })
        .catch((error) => {
          console.error('Email send error:', error);
          // You can handle errors, such as showing an error message to the user
        });
    };
    // second form
    const logFormData = (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
  
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });
  
      sendEmail(data);
  
      event.target.reset();
    };

    // third fucntion
    // const logFormData = (event) => {
    //     event.preventDefault(); 
    //     const formData = new FormData(event.target);
        
    //     formData.forEach((value, key) => {
    //       console.log(`${key}: ${value}`);
    //     });
    //     event.target.reset();
    // };
  return (
    <div className={style.bigBox}>
      <div className={style.blueSection}>
        {/* <div className={style.companyName}>LawFax</div> */}
        <div className={style.companyDescription}>Learn How LawFax Delivers the Best Results for Our Lawyers</div>
      </div>
      <div className={style.paragraph}>
        <li className={style.point}>Say how LawFax makes getting real results from social media easier through better collaboration, deeper insight, and stronger security</li>
        <li className={style.point}> Your demo includes how to:</li>
        <ul>
          <li className={style.point}>&#10003; Integrate with Tools and Platforms you rely on now</li>
          <li className={style.point}>&#10003; Optimize campaigns using real-time analytics</li>
          <li className={style.point}>&#10003; Prove social media ROI</li>
          <li className={style.point}>&#10003; Ensure Regulatory compliance and mitigate reputation risk</li>
          <li className={style.point}>&#10003; Protect against social media threats and crises</li>
        </ul>
        <li className={style.point}>Book your LawFax demo now, and we will contact you shortly to book a convenient time.</li>
      </div>

      <div className={style.container}>
        <div>
          <h1 className={style.margin}><strong>Schedule a Demo</strong></h1>
        </div>
        <form className={style.formContainer} id="demo-form" onSubmit={logFormData}>
          <input className={style.name} type="text" id="name" name="name" placeholder="Full Name" required />
          <input className={style.contact} type="tel" id="contact" name="contact" placeholder="Contact Number" required pattern="[0-9]{10}" />
          <input className={style.email} type="email" id="email" name="email" placeholder="Business Email Address" required />
          <input className={style.company} type="text" id="company" name="company" placeholder="Company" required />
          <div  className={`${style.demoForm} ${style.flexLabelAbove}`}>
          <select id="role" name="role" defaultValue="" required>
    <option value="" disabled>Select Role</option>
              <option>Chief Executive Officer (CEO)</option>
              <option>Chief Financial Officer (CFO)</option>
              <option>Chief Operating Officer (COO)</option>
              <option>Chief Marketing Officer (CMO)</option>
              <option>Chief Technology Officer (CTO)</option>
              <option>President</option>
              <option>Vice President</option>
              <option>Director</option>
              <option>Administrative Assistant</option>
              <option>Manager</option>
              <option>Receptionist</option>
              <option>Executive Assistant </option>
              <option>Sales Associate/Representative</option>
              <option>Digital Marketing Specialist</option>
              <option>Research Analyst</option>
              <option>Accountant</option>
              <option>Recruiter</option>
              <option>Benefits Administrator</option>
              <option>In-house Counsel</option>
              <option>Legal Assistant</option>
              <option>Contract Manager</option>
              <option>Paralegal</option>
              <option>Lawyer</option>
              <option>Prosecutor</option>
              <option>Alternative Dispute Resolution (ADR) Specialist</option>
              <option>Legal Researcher</option>
              <option>Legal Consultant</option>
              
            </select>
          </div>
          
          <br />
          <p> <input type="checkbox" id="terms-checkbox" className={style.privacy} required/>
          Agree to  <a href="terms.html" target="_blank" style={{ fontSize: '12px', color: 'orange', whiteSpace: 'nowrap' }}>Terms of Use</a> &amp; <a href="privacy.html" target="_blank" style={{ fontSize: '12px', color: 'orange', whiteSpace: 'nowrap' }}>Privacy Policy</a>
          </p>
          <br />
          <button className={style.btn} type="submit" id="submit-button">Request a Demo</button>
        </form>
      </div>
    </div>
  );
};

export default DemoRequestForm;
