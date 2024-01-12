import React, { useState } from 'react';
import style from './NotificationSetting.module.css';
import DasboardNavbar from '../../DashboardNavbar/DashboardNavbar'
import { useNavigate } from 'react-router-dom';

const NotificationSetting = ({onClose}) => {
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [whatsAppNotifications, setWhatsAppNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [emailOptions, setEmailOptions] = useState({
    DailyDigest: false,
    TaskList: false,
    HearingDate: false,
    NewCase: false,
    CaseDisposal: false,
  });

  const [whatsAppOptions, setWhatsAppOptions] = useState({
    DailyDigest: false,
    TaskList: false,
    HearingDate: false,
    NewCase: false,
    CaseDisposal: false, 
  });

  const [smsOptions, setSmsOptions] = useState({
    DailyDigest: false,
    TaskList: false,
    HearingDate: false,
    NewCase: false,
    CaseDisposal: false,
  });

  // Function to handle the form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    // Process the form data
    console.log({
      emailNotifications,
      whatsAppNotifications,
      smsNotifications,
      emailOptions,
      whatsAppOptions,
      smsOptions

    });
    // Send the data to the server or some other processing
  };

  // Handle change for email options checkboxes
  const handleEmailOptionChange = (event) => {
    const { name, checked } = event.target;
    setEmailOptions((prevOptions) => ({
      ...prevOptions,
      [name]: checked,
    }));
  };

  const handleWhatsAppOptionChange = (event) => {
    const { name, checked } = event.target;
    setWhatsAppOptions((prevOptions) => ({
      ...prevOptions,
      [name]: checked,
    }));
  };

  const handleSmsOptionChange = (event) => {
    const { name, checked } = event.target;
    setSmsOptions((prevOptions) => ({
      ...prevOptions,
      [name]: checked,
    }));
  };

  // const navigator = useNavigate();
  const HandleCancel=()=>{
    // navigator(0)
    onClose();
  }

  return (
    <>
    {/* <DasboardNavbar /> */}
    <div className={style.MainContainer}>
    <form onSubmit={handleSubmit} className={style.container}>
      <h1 className={style.title}>Notification Updates</h1>

  <h2 className={style.sectionTitle}>Notification preference</h2>

      
  <div className={style.notificationOption}>
    <label>
      <input
        type="checkbox"
        // checked={emailNotifications}
        // onChange={() => setEmailNotifications(!emailNotifications)}
      />
      All Cases
    </label>
 
    <label>
      <input
        type="checkbox"
        // checked={emailNotifications}
        // onChange={() => setEmailNotifications(!emailNotifications)}
      />
      Specific Priorities
    </label>
  </div>

      {/* Email Notification Section */}
      <div className={style.section}>
        <h2 className={style.sectionTitle}>Email Notification</h2>
        <label className={style.toggleSwitch}>
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={() => setEmailNotifications(!emailNotifications)}
          />
          <span className={style.slider}></span>
        </label>
        {emailNotifications && (
          <>
            <input type="text" placeholder="Enter email" className={style.inputField} />
            {/* Additional email options */}
            {Object.keys(emailOptions).map((option) => (
              <div key={option}>
                <label>
                  <input
                    type="checkbox"
                    name={option}
                    checked={emailOptions[option]}
                    onChange={handleEmailOptionChange}
                  />
                  {option.replace(/([A-Z])/g, ' $1').trim()} 
                </label>
              </div>
            ))}
          </>
        )}
      </div>
      <div className={style.section}>
        <h2 className={style.sectionTitle}>WhatsApp Notification</h2>
        <label className={style.toggleSwitch}>
          <input
            type="checkbox"
            checked={whatsAppNotifications}
            onChange={() => setWhatsAppNotifications(!whatsAppNotifications)}
          />
          <span className={style.slider}></span>
        </label>

        
        {whatsAppNotifications && (
          <>
            <input type="text" placeholder="Enter WhatsApp Number" className={style.inputField} />
            {/* Additional email options */}
            {Object.keys(whatsAppOptions).map((option) => (
              <div key={option}>
                <label>
                  <input
                    type="checkbox"
                    name={option}
                    checked={whatsAppOptions[option]}
                    onChange={handleWhatsAppOptionChange}
                  />
                  {option.replace(/([A-Z])/g, ' $1').trim()} {/* Add spaces before capital letters */}
                </label>
              </div>
            ))}
          </>
        )}
      </div>
      <div className={style.section}>
        <h2 className={style.sectionTitle}>Sms Notification</h2>
        <label className={style.toggleSwitch}>
          <input
            type="checkbox"
            checked={smsNotifications}
            onChange={() => setSmsNotifications(!smsNotifications)}
          />
          <span className={style.slider}></span>
        </label>


        {smsNotifications && (
          <>
            <input type="text" placeholder="Enter Phone Number" className={style.inputField} />
            {/* Additional email options */}
            {Object.keys(smsOptions).map((option) => (
              <div key={option}>
                <label>
                  <input
                    type="checkbox"
                    name={option}
                    checked={smsOptions[option]}
                    onChange={handleSmsOptionChange}
                  />
                  {option.replace(/([A-Z])/g, ' $1').trim()} {/* Add spaces before capital letters */}
                </label>
              </div>
            ))}
          </>
        )}
      </div>
      
      {/* Additional sections for WhatsApp and SMS Notifications */}
      {/* ... */}

      {/* Buttons */}
      <div className={style.buttonGroup}>
        <button type="submit" className={style.button}>Submit</button>
        <button type="button" onClick={HandleCancel} className={`${style.button} ${style.cancelButton}`}>Cancel</button>
      </div>
    </form>
</div>
</>
  );
};
export default NotificationSetting;
