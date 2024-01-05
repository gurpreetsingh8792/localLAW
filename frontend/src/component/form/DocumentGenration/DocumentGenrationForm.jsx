import React from 'react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import styles from './DocumentGenration.module.css';
import SideNav from '../../utilities/SideNavBar/SideNav';

const initialValues = {
  name: '',
  address: '',
  state: '',
  district: '',
  pincode: '',
  email: '',
  mobile: '',
  adhaarFirst: '',
  adhaarSecond: '',
  adhaarThird: '',
};

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  address: Yup.string().required('Address is required'),
  state: Yup.string().required('State is required'),
  district: Yup.string().required('District is required'),
  pincode: Yup.string().required('Pincode is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  mobile: Yup.string().required('Mobile number is required'),
  adhaarFirst: Yup.string().matches(/^\d{4}$/, 'Invalid Adhaar'),
  adhaarSecond: Yup.string().matches(/^\d{4}$/, 'Invalid Adhaar'),
  adhaarThird: Yup.string().matches(/^\d{4}$/, 'Invalid Adhaar'),
});

const states = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Lakshadweep',
    'Delhi',
    'Puducherry'
  ];

const districts = {
  'Andhra Pradesh': ['Dis 1', 'District 2', 'District 3'],
  'Arunachal Pradesh': ['District A', 'District B', 'District C'],
  'Assam': ['District X', 'District Y', 'District Z'],
  // Add more districts for other states here
};

const DocumentGenrationForm = () => {
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, {resetForm}) => {
      // Handle form submission here
      console.log(values);
      alert('Form submitted successfully!');
    
     
      resetForm();
    },
  });

  const handleStateChange = (e) => {
    formik.handleChange(e);
    formik.setFieldValue('district', ''); 
  };

  const navigate = useNavigate();
  const HandleCancel=()=>{
    navigate('/dashboard')
  }

  return (
    <>
      <SideNav />
      <form className={styles.form} onSubmit={formik.handleSubmit}>
        <table className={styles.table}>
          <tbody>
            <tr>
              <td  className={styles.td}>
                <label className={styles.label} htmlFor="name">Name<span className={styles.required}>*</span></label>
              </td>
              <td className={styles.cell}>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={styles.input}
                  placeholder="e.g., Ankur"
                  onChange={formik.handleChange}
                  value={formik.values.name}
                />
              </td>
            </tr>
            <tr>
              <td className={styles.td1}>
                <label className={styles.label} htmlFor="address">Address<span className={styles.required}>*</span></label>
              </td>
              <td className={styles.cell1}>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className={styles.input}
                  placeholder="e.g., SS Nagar"
                  onChange={formik.handleChange}
                  value={formik.values.address}
                />
              </td>
            </tr>
            <tr>
              <td className={styles.td}>
                <label className={styles.label} htmlFor="state">State<span className={styles.required}>*</span></label>
              </td>
              <td className={styles.cell}>
                <select
                  id="state"
                  name="state"
                  className={styles.input}
                  onChange={handleStateChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.state}
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {formik.touched.state && formik.errors.state ? (
                  <div className={styles.error}>{formik.errors.state}</div>
                ) : null}
              </td>
            </tr>
            <tr>
              <td className={styles.td1}>
                <label className={styles.label} htmlFor="district">District<span className={styles.required}>*</span></label>
              </td>
              <td className={styles.cell1}>
                <select
                  id="district"
                  name="district"
                  className={styles.input}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.district}
                >
                  <option value="">Select District</option>
                  {districts[formik.values.state]?.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                {formik.touched.district && formik.errors.district ? (
                  <div className={styles.error}>{formik.errors.district}</div>
                ) : null}
              </td>
            </tr>
            <tr>
              <td className={styles.td}>
                <label className={styles.label} htmlFor="pincode">Pincode<span className={styles.required}>*</span></label>
              </td>
              <td className={styles.cell}>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  className={styles.input}
                  placeholder="e.g., 100000"
                  onChange={formik.handleChange}
                  value={formik.values.pincode}
                />
              </td>
            </tr>
            <tr>
              <td className={styles.td1}>
                <label className={styles.label} htmlFor="email">Email<span className={styles.required}>*</span></label>
              </td>
              <td className={styles.cell1}>
                <input
                  type="text"
                  id="email"
                  name="email"
                  className={styles.input}
                  placeholder="e.g., abc@gmail.com"
                  onChange={formik.handleChange}
                  value={formik.values.email}
                />
              </td>
            </tr>
            <tr>
              <td className={styles.td}>
                <label className={styles.label} htmlFor="mobile">Mobile No<span className={styles.required}>*</span></label>
              </td>
              <td className={styles.cell}>
                <input
                  type="text"
                  id="mobile"
                  name="mobile"
                  className={styles.input}
                  placeholder="Mobile Number"
                  onChange={formik.handleChange}
                  value={formik.values.mobile}
                />
              </td>
            </tr>
            <tr>
              <td className={styles.td1}>
                <label className={styles.label} htmlFor="adhaar">Aadhaar Card No.</label>
              </td>
              <td className={styles.cell1}>
                <div className={styles.adhaarInputs}>
                  <input
                    type="text"
                    id="adhaarFirst"
                    name="adhaarFirst"
                    className={styles.input}
                    placeholder="e.g., 1234"
                    onChange={formik.handleChange}
                    value={formik.values.adhaarFirst}
                  />
                  <input
                    type="text"
                    id="adhaarSecond"
                    name="adhaarSecond"
                    placeholder="e.g., 1234"
                    className={styles.input}
                    onChange={formik.handleChange}
                    value={formik.values.adhaarSecond}
                  />
                  <input
                    type="text"
                    id="adhaarThird"
                    name="adhaarThird"
                    placeholder="e.g., 1234"
                    className={styles.input}
                    onChange={formik.handleChange}
                    value={formik.values.adhaarThird}
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div className={styles.row}>
          <button type="submit" className={styles.submitButton}>Submit</button>
        </div>
      </form>
    </>
  );
};

export default DocumentGenrationForm;
