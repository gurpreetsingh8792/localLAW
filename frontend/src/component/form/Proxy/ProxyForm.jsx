import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import style from './Proxy.module.css';
import axios from 'axios';
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar'

const Proxy = () => {
  const [isSuccessPopupVisible, setIsSuccessPopupVisible] = useState(false);
  const [cases, setCases] = useState([]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await axios.get('http://localhost:8052/caseform', {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        setCases(response.data);
        console.log("Cases:", response.data); // Logging loaded cases
      } catch (error) {
        console.error('Error fetching cases:', error);
      }
    };
    fetchCases();
  }, []);


  const handleSubmit = async (values, { resetForm }) => {
    try {
      // Make an HTTP POST request to the backend with the full server URL
      const response = await axios.post('http://localhost:8052/proxy', values, {
        headers: {
          'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
        },
      });

      console.log(response.data); // Log the response from the backend
      alert('Proxy Added successfully!');
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const formik = useFormik({
    initialValues: {
      fullName: '',
      streetAddress: '',
      city: '',
      zipStateProvince: '',
      zipPostalCode: '',
      date: '',
      case: '',
      caseFile: null,
      causeTitle: '',
      honorableJudge: '',
      courtNumber: '',
      type: '',
      timeOfHearing: '',
      dateOfHearing: '',
      comments: '',
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required('Full Name is required'),
      // streetAddress: Yup.string().required('Street Address is required'),
      // city: Yup.string().required('City is required'),
      // zipStateProvince: Yup.string().required('State/Province is required'),
      zipPostalCode: Yup.string().required('Zip/Postal Code is required'),
      // date: Yup.date().required('Date is required'),
      case: Yup.string().required('Case is required'),
      // caseFile: Yup.mixed().test('fileType', 'Invalid file type. Only PDF files are allowed', (value) => {
      //   if (!value) return true;
      //   return value && value.type === 'application/pdf';
      // }),
      // causeTitle: Yup.string().required('Cause Title is required'),
      // honorableJudge: Yup.string().required('Honorable Judge is required'),
      courtNumber: Yup.string().required('Court Number is required'),
      // type: Yup.string().required('Type is required'),
      // timeOfHearing: Yup.string().required('Time of Hearing is required'),
      dateOfHearing: Yup.date().required('Date of Hearing is required'),
      comments: Yup.string(),
    }),
    onSubmit: handleSubmit, 
  }); 
  

  const closeSuccessPopup = () => {
    setIsSuccessPopupVisible(false);
  };

  return (
    <>
      <DashboardNavbar/>
      
      <form className={style.formContainer} onSubmit={formik.handleSubmit}>
      <h2 style={{textAlign:'center'}}>Proxy</h2>
        <div className={style.row}>
          <div className={style.field}>
            <label className={style.label} htmlFor="fullName">Full Name</label>
            <input
              className={style.text}
              type="text"
              id="fullName"
              name="fullName"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.fullName}
            />
            {formik.touched.fullName && formik.errors.fullName ? (
              <div className={style.error}>{formik.errors.fullName}</div>
            ) : null}
          </div>
        </div>
        <div className={style.row}>
          <div className={style.field}>
            <label className={style.label} htmlFor="streetAddress">Street Address</label>
            <input
              className={style.text}
              type="text"
              id="streetAddress"
              name="streetAddress"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.streetAddress}
            />
            {formik.touched.streetAddress && formik.errors.streetAddress ? (
              <div className={style.error}>{formik.errors.streetAddress}</div>
            ) : null}
          </div>
          <div className={style.field}>
            <label className={style.label} htmlFor="city">City</label>
            <input
              className={style.text}
              type="text"
              id="city"
              name="city"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.city}
            />
            {formik.touched.city && formik.errors.city ? (
              <div className={style.error}>{formik.errors.city}</div>
            ) : null}
          </div>
        </div>
        <div className={style.row}>
          <div className={style.field}>
            <label className={style.label} htmlFor="zipStateProvince">State/Province</label>
            <input
              className={style.text}
              type="text"
              id="zipStateProvince"
              name="zipStateProvince"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.zipStateProvince}
            />
            {formik.touched.zipStateProvince && formik.errors.zipStateProvince ? (
              <div className={style.error}>{formik.errors.zipStateProvince}</div>
            ) : null}
          </div>
          <div className={style.field}>
            <label className={style.label} htmlFor="zipPostalCode">Zip/Postal Code</label>
            <input
              className={style.text}
              type="text"
              id="zipPostalCode"
              name="zipPostalCode"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.zipPostalCode}
            />
            {formik.touched.zipPostalCode && formik.errors.zipPostalCode ? (
              <div className={style.error}>{formik.errors.zipPostalCode}</div>
            ) : null}
          </div>
        </div>
        <div className={style.row}>
          <div className={style.field}>
            <label className={style.label} htmlFor="date">Date</label>
            <input
              className={style.date}
              type="date"
              id="date"
              name="date"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.date}
            />
            {formik.touched.date && formik.errors.date ? (
              <div className={style.error}>{formik.errors.date}</div>
            ) : null}
          </div>
          <div className={style.field}>
  <label className={style.label} htmlFor="case">Case</label>
  <select
    className={style.select}
    id="case"
    name="case"
    onChange={formik.handleChange}
    onBlur={formik.handleBlur}
    value={formik.values.case}
  >
    <option value="" label="Select Case" />
    {cases.map((caseItem) => (
      <option key={caseItem.id} value={caseItem.title}>
      {caseItem.title}
    </option>
    ))}
  </select>
  {formik.touched.case && formik.errors.case ? (
    <div className={style.error}>{formik.errors.case}</div>
  ) : null}
</div>

          
        </div>
        <div className={style.field}>
            <label className={style.label} htmlFor="caseFile">Case File (PDF only)</label>
            <input
              className={style.file}
              type="file"
              id="caseFile"
              name="caseFile"
              accept=".pdf"
              onChange={(event) => {
                formik.setFieldValue('caseFile', event.currentTarget.files[0]);
              }}
            />
            {formik.touched.caseFile && formik.errors.caseFile ? (
              <div className={style.error}>{formik.errors.caseFile}</div>
            ) : null}
          </div>
        <div className={style.row}>
          
          <div className={style.field}>
            <label className={style.label} htmlFor="causeTitle">Cause Title</label>
            <input
              className={style.text}
              type="text"
              id="causeTitle"
              name="causeTitle"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.causeTitle}
            />
            {formik.touched.causeTitle && formik.errors.causeTitle ? (
              <div className={style.error}>{formik.errors.causeTitle}</div>
            ) : null}
          </div>
          <div className={style.field}>
            <label className={style.label} htmlFor="honorableJudge">Honorable Judge</label>
            <input
              className={style.text}
              type="text"
              id="honorableJudge"
              name="honorableJudge"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.honorableJudge}
            />
            {formik.touched.honorableJudge && formik.errors.honorableJudge ? (
              <div className={style.error}>{formik.errors.honorableJudge}</div>
            ) : null}
          </div>
        </div>
        <div className={style.row}>
          <div className={style.field}>
            <label className={style.label} htmlFor="type">Court Type</label>
            <select
            className={style.select}
              id="type"
              name="type"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.type}
            >
              <option value="" label="Select Court Type" />
              <option value="High">High Court</option>
              <option value="Consumer">Consumer Court</option>
              <option value="Supreme">Supreme Court</option>
              <option value="District">District Court</option>
              <option value="Tribunal">Tribunal</option>
              <option value="Revenue">Revenue Court</option>
              <option value="Department">Department Court</option>
              <option value="LokAdalat">Lok Adalat</option>
              <option value="Other">Other</option>
              {/* Add more options as needed */}
            </select>
            {formik.touched.type && formik.errors.type ? (
              <div className={style.error}>{formik.errors.type}</div>
            ) : null}
          </div>
          <div className={style.field}>
    <label className={style.label} htmlFor="timeOfHearing">Time of Hearing</label>
    <input
    className={style.time}
      type="time"
      id="timeOfHearing"
      name="timeOfHearing"
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      value={formik.values.timeOfHearing}
      
    />
    {formik.touched.timeOfHearing && formik.errors.timeOfHearing ? (
      <div className={style.error}>{formik.errors.timeOfHearing}</div>
    ) : null}
  </div>
        </div>
        <div className={style.row}>
          <div className={style.field}>
            <label className={style.label} htmlFor="courtNumber">Court Number</label>
            <input
              className={style.text}
              type="text"
              id="courtNumber"
              name="courtNumber"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.courtNumber}
            />
            {formik.touched.courtNumber && formik.errors.courtNumber ? (
              <div className={style.error}>{formik.errors.courtNumber}</div>
            ) : null}
          </div>
        
        
          <div className={style.field}>
            <label className={style.label} htmlFor="dateOfHearing">Date of Hearing</label>
            <input
              className={style.dateOfHearing}
              type="date"
              id="dateOfHearing"
              name="dateOfHearing"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.dateOfHearing}
            />
            {formik.touched.dateOfHearing && formik.errors.dateOfHearing ? (
              <div className={style.error}>{formik.errors.dateOfHearing}</div>
            ) : null}
          </div>
        </div>
        <div className={style.row}>
          <div className={style.field}>
            <label className={style.label} htmlFor="comments">Comments</label>
            <textarea
              className={style.textarea}
              id="comments"
              name="comments"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.comments}
              style={{ width: '100%', height:'150%' }}
            />
            {formik.touched.comments && formik.errors.comments ? (
              <div className={style.error}>{formik.errors.comments}</div>
            ) : null}
          </div>
        </div>
        <div className={style.row}>
          <div className={style.field}>
            <button className={style.btn} type="submit">Submit</button>
          </div>
        </div>
      </form>
    
</>
  );
};
export default Proxy;