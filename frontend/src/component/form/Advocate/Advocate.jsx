import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styles from './Advocate.module.css';
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar';
import axios from 'axios';

const validationSchema = Yup.object().shape({
  hearingCourt: Yup.string().required('Hearing Court is required'),
  advocateName: Yup.string().required('Advocate Name is required'),
 
});

const initialValues = {
  hearingCourt: '',
  advocateName: '',
  
};

const AdvocateForm = () => {
  const handleSubmit = async (values, { resetForm }) => {
    try {
      // Make an HTTP POST request to the backend with the full server URL
      const response = await axios.post('http://localhost:8052/advocate', values, {
        headers: {
          'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
        },
      });

      console.log(response.data); // Log the response from the backend
      alert('Advocate Added successfully!');
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };


  return (
    <div className={styles.MainContiner}>
    <DashboardNavbar />
    <div className={styles.container}>
      {/* <h2 className={styles.title}>Party Name</h2> */}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="hearingCourt" className={styles.label}>Hearing Court</label>
            <Field
              as="select"
              id="hearingCourt"
              name="hearingCourt"
              
              className={styles.selectField}
            >
              <option value="" disabled selected>
                Select Hearing Court
              </option>
              <option value="District court">District court</option>
              <option value="District court (CNR Number) Ecourt services">
                District court (CNR Number) Ecourt services
              </option>
              <option value="Supreme court of india">Supreme court of india</option>
              <option value="High court (CNR Number) Ecourt services">
                High court (CNR Number) Ecourt services
              </option>
              <option value="Bombay High Court">Bombay High Court</option>
              <option value="Delhi High Court">Delhi High Court</option>
              <option value="Debts Recovery Tribunal-DRT">Debts Recovery Tribunal-DRT</option>
              <option value="Debts Recovery Apellate Tribunal-DRAT">
                Debts Recovery Apellate Tribunal-DRAT
              </option>
              <option value="National Company Law Tribunal-NCLT">
                National Company Law Tribunal-NCLT
              </option>
              <option value="Consumer Dispute Redressal Commission-NCDRC/State consumer forum/District consumer forum">
                Consumer Dispute Redressal Commission-NCDRC/State consumer forum/District consumer forum
              </option>
              <option value="Karnataka High Court">Karnataka High Court</option>
              <option value="Madhya Pradesh High Court">Madhya Pradesh High Court</option>
              <option value="Apellate tribunal for electricity-APTEL">
                Apellate tribunal for electricity-APTEL
              </option>
              <option value="National company Law Apellate Tribunal-NCLAT">
                National company Law Apellate Tribunal-NCLAT
              </option>
              <option value="Telecom Disputes Settlement Apellate Tribunal-TDSAT">
                Telecom Disputes Settlement Apellate Tribunal-TDSAT
              </option>
              <option value="National Green Tribunal-NGT">National Green Tribunal-NGT</option>
              <option value="Customers Excuse and Service Tax Apellate Tribunal-ITAT">
                Customers Excuse and Service Tax Apellate Tribunal-ITAT
              </option>
              <option value="Apellate tribunal for forfeited property-ATEP">
                Apellate tribunal for forfeited property-ATEP
              </option>
              <option value="Armed Forces Tribunal-AFT">Armed Forces Tribunal-AFT</option>
              <option value="Telangana Commercial Court-TCC">Telangana Commercial Court-TCC</option>
              <option value="Andhra pradesh High Court">Andhra pradesh High Court</option>
              <option value="Himachal pradesh High Court">Himachal pradesh High Court</option>
              <option value="Kerala High Court">Kerala High Court</option>
              <option value="Patna High Court">Patna High Court</option>
              <option value="Jharkhand High Court">Jharkhand High Court</option>
              <option value="Madras High Court">Madras High Court</option>
              <option value="Rajasthan High Court">Rajasthan High Court</option>
              <option value="Orissa High Court">Orissa High Court</option>
              <option value="Jammu & Kashmir High Court">Jammu & Kashmir High Court</option>
              <option value="Allahabad High Court">Allahabad High Court</option>
              <option value="Uttrakhand High Court">Uttrakhand High Court</option>
              <option value="Calcutta High Court">Calcutta High Court</option>
              <option value="Chattisgarh High Court">Chattisgarh High Court</option>
              <option value="Tripura High Court">Tripura High Court</option>
              <option value="Meghalya High Court">Meghalya High Court</option>
              <option value="Punjab & Haryana High Court">Punjab & Haryana High Court</option>
              <option value="Sikkim High Court">Sikkim High Court</option>
              <option value="Manipur High Court">Manipur High Court</option>
              <option value="Telangana High Court">Telangana High Court</option>
            </Field>
            <ErrorMessage name="hearingCourt" component="div" className={styles.error} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="advocateName" className={styles.label}>Advocate Name</label>
            <Field
              type="text"
              id="advocateName"
              name="advocateName"
              
              className={styles.inputFieldText}
            />
            <ErrorMessage name="advocateName" component="div" className={styles.error} />
          </div>
          <div className={styles.BtnContainer}>
          <button type="submit" className={styles.submitButton}>Submit</button>
          <button type="submit" className={styles.submitButton}>Cancel</button>
          </div>

          
        </Form>
      </Formik>
    </div>
    </div>
  );
};

export default AdvocateForm;
