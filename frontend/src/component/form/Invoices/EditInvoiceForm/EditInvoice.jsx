import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { NavLink } from 'react-router-dom';
import styles from './EditInvoiceForm.module.css';
import axios from 'axios';


const generateInvoiceNo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${date}-${hours}${minutes}${seconds}`;
};

const initialValues = {
  client: '',
  caseType: '',
  date: '',
  amount: '',
  taxType: '',
  taxPercentage: '',
  fullAddress: '',
  hearingDate: '',
  title: '',
  dateFrom: '',
  dateTo: '',
  expensesAmount: '',
  expensesTaxType: '',
  expensesTaxPercentage: '',
  expensesCumulativeAmount: '',
  addDoc: '',
  invoiceNumber: generateInvoiceNo(),
};



const validationSchema = Yup.object().shape({
  client: Yup.string(),
  caseType: Yup.string(),
  date: Yup.date(),
  amount: Yup.number().min(0, 'Amount must be greater than or equal to 0'),
  taxType: Yup.string(),
  taxPercentage: Yup.number().min(0, 'Tax Percentage must be greater than or equal to 0'),
  fullAddress: Yup.string(),
  hearingDate: Yup.date(),
  title: Yup.string().required('title is required'),
  dateFrom: Yup.date(),
  dateTo: Yup.date(),
  expensesAmount: Yup.number().min(0, 'Amount must be greater than or equal to 0'),
  expensesTaxType: Yup.string(),
  expensesTaxPercentage: Yup.number().min(0, 'Tax Percentage must be greater than or equal to 0'),
  expensesCumulativeAmount: Yup.number().min(0, 'Cumulative Amount must be greater than or equal to 0'),
  addDoc: Yup.mixed(),
});


const EditInvoicesForm = () => {
  const [clientNames, setClientNames] = useState([]); // State to store client names
  const [caseTitles, setCaseTitles] = useState([]); // State to store case titles

  useEffect(() => {
    // Fetch client names and populate the select options
    const fetchClientNames = async () => {
      try {
        const clientResponse = await axios.get('http://localhost:8052/clientform', {
          headers: {
            'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
          },
        });

        // Extract the client names from the response data
        const clientNameArray = clientResponse.data.map((client) => client.firstName);
        setClientNames(clientNameArray);
      } catch (error) {
        console.error(error);
      }
    };

    // Fetch case titles and populate the select options
    const fetchCaseTitles = async () => {
      try {
        const caseResponse = await axios.get('http://localhost:8052/caseform', {
          headers: {
            'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
          },
        });

        // Extract the case titles from the response data
        const caseTitleArray = caseResponse.data.map((caseItem) => caseItem.title);
        setCaseTitles(caseTitleArray);
      } catch (error) {
        console.error(error);
      }
    };

    fetchClientNames(); // Call the fetchClientNames function when the component mounts
    fetchCaseTitles(); // Call the fetchCaseTitles function when the component mounts
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      // Make an HTTP POST request to the backend with the full server URL
      const response = await axios.post('http://localhost:8052/invoiceform', values, {
        headers: {
          'x-auth-token': localStorage.getItem('token'), // Get the token from localStorage or your authentication mechanism
        },
      });

      console.log(response.data); // Log the response from the backend
      alert('Invoice Added successfully!');
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
    <div className={styles.formContainer}>
    <h2 style={{textAlign:'center'}}>Generate Invoice's</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className={styles.invoiceNo}><span style={{ color: 'var(--color-primary)'}}>INV</span>
  {generateInvoiceNo()}</div>
            <div className={styles.clientContainer}>
            <Field as="select" name="client" className={styles.selectFieldClient}>
                  <option value="">Select Client</option>
                  {clientNames.map((clientName) => (
                    <option key={clientName} value={clientName}>
                      {clientName}
                    </option>
                  ))}
                </Field>
              <NavLink to="/dashboard/peopleform" className={styles.link}>
                Add New Client
              </NavLink>
            </div>
            <ErrorMessage name="client" component="div" className={styles.errorMessage} />

            <div className={styles.fieldContainer}>
            <Field as="select" id="caseType" name="caseType" className={styles.selectFieldType}>
                  <option value="">Select a Case</option>
                  {caseTitles.map((caseTitle) => (
                    <option key={caseTitle} value={caseTitle}>
                      {caseTitle}
                    </option>
                  ))}
                </Field>
              <Field type="date" name="date" className={styles.inputField} />
            </div>
            <ErrorMessage name="caseType" component="div" className={styles.errorMessage} />
            <ErrorMessage name="date" component="div" className={styles.errorMessage} />

            <div className={styles.fieldContainer}>
              <Field type="number" name="amount" className={styles.inputField} placeholder="Amount" />
              <Field as="select" name="taxType" className={styles.selectFieldTaxType}>
                <option value="">Select Tax Type</option>
                <option value="SGST">SGST</option>
                <option value="CGST">CGST</option>
                <option value="IGST">IGST</option>
                <option value="ST">ST</option>
              </Field>
              <Field type="number" name="taxPercentage" className={styles.inputField} placeholder="Tax Percentage" />
            </div>
            <ErrorMessage name="amount" component="div" className={styles.errorMessage} />
            <ErrorMessage name="taxType" component="div" className={styles.errorMessage} />
            <ErrorMessage name="taxPercentage" component="div" className={styles.errorMessage} />

            <Field as="textarea" name="fullAddress" className={styles.textareaField} placeholder="Full Address" />
            <ErrorMessage name="fullAddress" component="div" className={styles.errorMessage} />

            {/* <label className={styles.label} htmlFor="hearingDate">Hearing Date</label>
            <Field type="date" name="hearingDate" className={styles.inputFieldHearingDate} />
            <ErrorMessage name="hearingDate" component="div" className={styles.errorMessage} /> */}

            <div className={styles.expensesTitle}>EXPENSES</div>
            <label className={styles.label} htmlFor="title">Title</label>
            <Field type="text" name="title" className={styles.inputFieldTitle} />
            <ErrorMessage name="title" component="div" className={styles.errorMessage} />

            <div className={styles.fieldContainer}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="dateFrom">
                  Date From:
                </label>
                <Field type="date" name="dateFrom" className={styles.inputField1} />
              </div>
              <div className={styles.fieldGroup3}>
                <label className={styles.label} htmlFor="dateTo">
                  Date To:
                </label>
                <Field type="date" name="dateTo" className={styles.inputField2} />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="expensesAmount">
                  Amount:
                </label>
                <Field type="number" name="expensesAmount" className={styles.inputField3} placeholder="Amount" />
              </div>
            </div>
            <ErrorMessage name="dateFrom" component="div" className={styles.errorMessage} />
            <ErrorMessage name="dateTo" component="div" className={styles.errorMessage} />
            <ErrorMessage name="expensesAmount" component="div" className={styles.errorMessage} />

            <div className={styles.fieldContainer}>
              <Field as="select" name="expensesTaxType" className={styles.selectFieldTaxType}>
                <option value="">Select Tax Type</option>
                <option value="SGST">SGST</option>
                <option value="CGST">CGST</option>
                <option value="IGST">IGST</option>
                <option value="ST">ST</option>
              </Field>
              <Field type="number" name="expensesTaxPercentage" className={styles.inputField} placeholder="Tax Percentage" />
              <Field type="number" name="expensesCumulativeAmount" className={styles.inputField} placeholder="Cumulative Amount" />
            </div>
            <ErrorMessage name="expensesTaxType" component="div" className={styles.errorMessage} />
            <ErrorMessage name="expensesTaxPercentage" component="div" className={styles.errorMessage} />
            <ErrorMessage name="expensesCumulativeAmount" component="div" className={styles.errorMessage} />

            <Field type="file" name="addDoc" accept=".pdf" className={styles.fileField} />
            <ErrorMessage name="addDoc" component="div" className={styles.errorMessage} />
         
          <div className={styles.BtnContainer}>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>Submit</button>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>Cancel</button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
    </>
  );
};

export default EditInvoicesForm;
