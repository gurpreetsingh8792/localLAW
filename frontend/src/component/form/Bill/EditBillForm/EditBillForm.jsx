import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styles from './EditBillForm.module.css';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';



const EditBillForm = ({ onClose, billData }) => {
  const [billingType, setBillingType] = useState(billData.billingType || ''); // Initialize with billData.billingType or an empty string
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();


  useEffect(() => {

    axios.get('http://localhost:8052/bill/edit', {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      })
      .then((response) => {
        const responseData = response.data[0];
        setFormData(responseData);
      })
      .catch((error) => {
        console.error(error);
      });

   
  }, []);

  const initialValues = {
    billNumber: billData.billNumber || '',
    title: billData.title || '',
    currentDate: billData.currentDate || '',
    dateFrom: billData.dateFrom || '',
    dateTo: billData.dateTo || '',
    fullAddress: billData.fullAddress || '',
    billingType: billingType,
    totalHours: billData. totalHours || '',
    noOfHearings: billData.noOfHearings || '',
    totalAmount: billData.totalAmount || '',
    amount: billData.amount || '',
    taxType: billData.taxType || '',
    taxPercentage: billData.taxPercentage || '',
    totalAmountWithTax: billData.totalAmountWithTax || '',
    description: billData.description || '',
    addDoc: '',
    span: billData.addDoc || '',
  };

  let validationSchema;

try {
  validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    currentDate: Yup.date(),
    dateFrom: Yup.date(),
    dateTo: Yup.date()
  .min(
    Yup.ref('dateFrom'),
    "Date To can't be before the Date From"
  ),
    fullAddress: Yup.string(),
    billingType: Yup.string(),
    // totalHours: Yup.string().when('billingType', {
    //   is: (val) => val === 'perHour',
    //   then: Yup.string().required('Total Hours is required when Billing Type is "perHour"'),
    //   otherwise: Yup.string(),
    // }),
    // noOfHearings: Yup.string().when('billingType', {
    //   is: (val) => val === 'perHearing',
    //   then: Yup.string().required('No. of Hearings is required when Billing Type is "perHearing"'),
    //   otherwise: Yup.string(),
    // }),
    // totalAmount: Yup.string().when('billingType', {
    //   is: (val) => val === 'flatFee',
    //   then: Yup.string().required('Total Amount is required when Billing Type is "flatFee"'),
    //   otherwise: Yup.string(),
    // }),
    amount: Yup.string(),
    taxType: Yup.string(),
    taxPercentage: Yup.string(),
    totalAmountWithTax: Yup.string(),
    description: Yup.string(),
    addDoc: Yup.mixed(),
  });
} catch (error) {
  console.error('An error occurred while creating the validation schema:', error);
}

const calculateTotalWithTax = (amount, taxPercentage) => {
  return amount + (amount * (taxPercentage / 100));
};

const handleFieldChange = (e, setFieldValue, values) => {
  const { name, value } = e.target;
  let amount = name === 'amount' ? parseFloat(value) || 0 : parseFloat(values.amount) || 0;
  let taxPercentage = name === 'taxPercentage' ? parseFloat(value) || 0 : parseFloat(values.taxPercentage) || 0;

  setFieldValue(name, value); // Update the changed field

  const totalWithTax = calculateTotalWithTax(amount, taxPercentage);
  setFieldValue('totalAmountWithTax', totalWithTax.toFixed(2)); // Update the total amount with tax
};

const handleSubmit = async (values, { resetForm }) => {
  try {
    // Make an HTTP POST request to update the case
    const response = await axios.put(
      `http://localhost:8052/bill/edit/update/${billData.id}`,
      values,
      {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      }
    );

    console.log(response.data);
    alert('Bill Updated successfully!');
    navigate(0);
    resetForm();
  } catch (error) {
    console.error(error);
  }
};

const onSubmit = (values, { resetForm }) => {
  handleSubmit(values, { resetForm });
};
const HandleCancel=()=>{
  onClose();
}

  return (
    <>
    <div className={styles['bill-form-container']}>
    <h2 style={{textAlign:'center'}}>Generate Bills</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ setFieldValue, values }) => (
        <Form>
        <div className={styles.billNo}><span style={{ color: 'var(--color-primary)'}}>BIL-</span>{initialValues.billNumber}</div>
          <div>
            <label className={styles.label}>Title</label>
            <Field type="text" name="title" className={styles['input-field']} />
            <ErrorMessage name="title" component="div" className={styles['error-message']} />
          </div>
          <div className={styles['horizontal-fields']}>
            <div>
              <label className={styles.label}>Current Date</label>
              <Field type="date" name="currentDate" className={styles['input-fieldCurrentDate']} />
              <ErrorMessage name="currentDate" component="div" className={styles['error-message']} />
            </div>
            <div>
              <label className={styles.label}>Date From</label>
              <Field type="date" name="dateFrom" className={styles['input-fieldDateFrom']} />
              <ErrorMessage name="dateFrom" component="div" className={styles['error-message']} />
            </div>
            <div>
              <label className={styles.label}>Date To</label>
              <Field type="date" name="dateTo" className={styles['input-fieldDateTo']} />
              <ErrorMessage name="dateTo" component="div" className={styles['error-message']} />
            </div>
          </div>
          
          <div>
            <label className={styles.label}>Billing Type</label>
            <Field
  as="select"
  name="billingType"
  className={styles['select-field']}
  onChange={(e) => setBillingType(e.target.value)}
  value={billingType} // Set the value to the current billingType state
>
  <option value="" disabled={!billingType}>
    Select your Billing Type
  </option>
  <option value="perHour">Per Hour</option>
  <option value="perHearing">Per Hearing</option>
  <option value="flatFee">Flat Fee</option>
</Field>

            <ErrorMessage name="billingType" component="div" className={styles['error-message']} />
          </div>
          {/* Conditional Fields */}
          {billingType === 'perHour' && (
            <div>
              <label className={styles.label}>Total Hours</label>
              <Field type="text" name="totalHours" className={styles['input-field']} />
              <ErrorMessage name="totalHours" component="div" className={styles['error-message']} />
            </div>
          )}
          {billingType === 'perHearing' && (
            <div>
              <label className={styles.label}>No. of Hearings</label>
              <Field type="text" name="noOfHearings" className={styles['input-field']} />
              <ErrorMessage name="noOfHearings" component="div" className={styles['error-message']} />
            </div>
          )}
          {billingType === 'flatFee' && (
            <div>
              <label className={styles.label}>Total Amount</label>
              <Field type="text" name="totalAmount" className={styles['input-field']} />
              <ErrorMessage name="totalAmount" component="div" className={styles['error-message']} />
            </div>
          )}
          <div className={styles['horizontal-fields']}>
            <div>
              <label className={styles.label}>Amount</label>
              <Field 
              type="text" 
              name="amount" 
              className={styles['input-fieldCurrentDate']} 
              onChange={(e) => handleFieldChange(e, setFieldValue, values)}
            />
              <ErrorMessage name="amount" component="div" className={styles['error-message']} />
            </div>
            <div>
              <label className={styles.label}>Tax Type</label>
              <Field as="select" name="taxType" className={styles['input-fieldDateFrom']}>
              <option value="" disabled>
                Select tax type
              </option>
                <option value="CGST">CGST</option>
                <option value="SGST">SGST</option>
                <option value="IGST">IGST</option>
                <option value="ST">ST</option>
              </Field>
              <ErrorMessage name="taxType" component="div" className={styles['error-message']} />
            </div>
            <div>
              <label className={styles.label}>Tax Percentage</label>
              <Field 
              type="text" 
              name="taxPercentage" 
              className={styles['input-fieldDateTo']} 
              onChange={(e) => handleFieldChange(e, setFieldValue, values)}
            />
              <ErrorMessage name="taxPercentage" component="div" className={styles['error-message']} />
            </div>
          </div>
          <div className={styles['horizontal-fields']}>
            <div>
              <label className={styles.label}>Total Amount with Tax</label>
              <Field 
              type="text" 
              name="totalAmountWithTax" 
              className={styles['input-field']} 
              readOnly
            />
              <ErrorMessage name="totalAmountWithTax" component="div" className={styles['error-message']} />
            </div>
            <div>
              <label className={styles.labelFile}>Add Doc</label>
              <Field type="file" name="addDoc" className={styles['file-upload']} />
              <span>{initialValues.span ? initialValues.span.split('\\').pop() : ''}</span>
            </div>
          </div>
          <div className={styles['horizontal-fields']}>
          <div>
            <label className={styles.label}>Full Address</label>
            <Field
              as="textarea"
              name="fullAddress"
              className={styles['textarea-field']}
            />
            <ErrorMessage name="fullAddress" component="div" className={styles['error-message']} />
          </div>
          <div>
            <label className={styles.label}>Description</label>
            <Field
              as="textarea"
              name="description"
              className={styles['textarea-field']}
            />
            <ErrorMessage name="description" component="div" className={styles['error-message']} />
          </div>
          </div>
          <div className={styles.BtnContainer}>
            <button type="submit" className={styles.submitButton}>Submit</button>
            <button type="submit" onClick={HandleCancel} className={`${styles.submitButton}, ${styles.CancelButton}`}>Cancel</button>
          </div>
        </Form>
        )}
      </Formik>
    </div>
    </>
  );
};

export default EditBillForm;