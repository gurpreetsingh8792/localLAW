import React from 'react';
import style from "./ConvertDocumnet.modulem.css"
import { Formik, Form, Field } from 'formik';

const ConvertDocument = () => {
  return (
    <div className={style.Container}>

    <Formik
      initialValues={{ documentText: '', file: null, language: '' }}  
      onSubmit={(values, { setSubmitting }) => {
        // handle form submission
        console.log(values);
        setSubmitting(false);
      }}
    >
      {({ isSubmitting, setFieldValue }) => (
        <Form className={style.FormContainer}>
          <div className={style.formGroup}>
            <label htmlFor="documentText" className={style.label}>Enter the doc here:</label>
            <Field name="documentText" as="textarea" placeholder="Type your document here..." className={`${style.input} ${style.textarea}`} />
          </div>

          <div className={style.formGroup}>
            <label htmlFor="file" className={style.label}>Choose a file:</label>
            <input
              id="file"
              name="file"
              type="file"
              onChange={(event) => {
                setFieldValue("file", event.currentTarget.files[0]);
              }}
              className={`${style.input} ${style.fileInput}`}
            />
          </div>

          <div className={style.formGroup}>
            <label htmlFor="language" className={style.label}>Choose language</label>
            <Field name="language" as="select" className={`${style.input} ${style.select}`}>
              <option value="">Select a language...</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              {/* Add other languages as needed */}
            </Field>
          </div>

          <div className={style.buttonGroup}>
            <button type="submit" disabled={isSubmitting} className={style.button}>
              Submit
            </button>
            <button type="reset" className={style.button}>
              Cancel
            </button>
            <button type="button" onClick={() => {/* define your delete action */}} className={style.button}>
              Delete
            </button>
          </div>
        </Form>
      )}
    </Formik>
    </div>
  );
}

export default ConvertDocument;
