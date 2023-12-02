import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styles from './CrnForm.module.css';
import SideNav from '../../utilities/SideNavBar/SideNav';
import axios from 'axios';

const validationSchema = Yup.object().shape({
  hearingCourt: Yup.string().required('Hearing Court is required'),
  caseType: Yup.string().required('Case Type is required'),
  caseNo: Yup.string(),
  caseYear: Yup.string()
    .required('Case Year is required')
    .matches(/^\d{4}$/, 'Please enter a valid year (e.g., 2023)'),
  

});

const initialValues = {
  hearingCourt: '',
  caseType: '',
  caseNo: '',
  caseYear: '',

};

const CnrForm = () => {
  const handleSubmit = async (values, { resetForm }) => {
    try {
      // Make an HTTP POST request to the backend with the full server URL
      const response = await axios.post('http://34.105.95.235:8051/cnr', values, {
        headers: {
          'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
        },
      });

      console.log(response.data); // Log the response from the backend
      alert('Cnr form Added successfully!');
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
    <SideNav />
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
              required
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
            <label htmlFor="caseType" className={styles.label}>Case Type</label>
            <Field
              type="text"
              id="caseType"
              name="caseType"
              required
              className={styles.inputFieldText}
            />
            <ErrorMessage name="caseType" component="div" className={styles.error} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="caseNo" className={styles.label}>Case Number</label>
            <Field
              type="text"
              id="caseNo"
              name="caseNo"
              required
              className={styles.inputFieldText}
            />
            <ErrorMessage name="caseNo" component="div" className={styles.error} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="caseYear" className={styles.label}>Case Year</label>
            <Field
              type="text"
              id="caseYear"
              name="caseYear"
              required
              pattern="[0-9]{4}"
              title="Please enter a valid year (e.g., 2023)"
              className={styles.inputFieldCaseYear}
            />
            <ErrorMessage name="caseYear" component="div" className={styles.error} />
          </div>
          <button type="submit" className={styles.submitButton}>SUBMIT</button>
        </Form>
      </Formik>
    </div>
    </>
  );
};

export default CnrForm;
