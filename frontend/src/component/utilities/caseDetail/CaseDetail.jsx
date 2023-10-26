import React, { useState, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import style from "./caseDetail.module.css";

const CaseDetail = () => {
  const [caseData, setCaseData] = useState(null);
  const [error, setError] = useState(null);
  const { case_no } = useParams();

  useEffect(() => {
    // Assemble the URL with the caseNo
    const URL = `http://localhost:4000/search?searchTerm=${case_no}&category=case_no`;
    // const URL = `http://localhost:4000/search?case_no=${case_no}&category=case_no`;
    // `http://localhost:4000/search?${queryParams.toString()}`
    console.log(case_no);
    // Fetch data when the component mounts and whenever caseNo changes
    fetch(URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        
        setCaseData(Array.isArray(data) ? data[0] : data);
      })
      .catch((err) => {
        console.error("Error fetching data: ", err);
        setError(err.toString());
      });
  }, [case_no]);

  
  return (
    <div className={style.container}>
    
      <div className={style.caseDetailContainer}>
        <h1>Case Detail for {case_no}</h1>
        {error ? <p>Error: {error}</p> : null}
        {caseData ? (
          <div className={style.caseDetail}>
            {/* <h2>{caseData.case_no}</h2> */}
            <p>
              <strong>Diary No:</strong> {caseData.diary_no}
            </p>
            <p>
              <strong>Petitioner:</strong> {caseData.pet}
            </p>
            <p>
              <strong>Respondent:</strong> {caseData.res}
            </p>
            <p>
              <strong>Petitioner's Advocate:</strong> {caseData.pet_adv}
            </p>
            <p>
              <strong>Respondent's Advocate:</strong> {caseData.res_adv}
            </p>
            <p>
              <strong>Bench:</strong> {caseData.bench}
            <p>
              <strong>Judgement Date:</strong> {caseData.judgement_date}
            </p>
            <p>
              <strong>Sections:</strong> {caseData.penal_code}
            </p>
            <p>
              <strong>Judgement by:</strong> {caseData.judgement_by}
            </p>
            </p>
            <p>
              <strong>Summary:</strong> {caseData.summary}
            </p>
            <p>
              <strong>File:</strong> <NavLink to={caseData.temp_link}> Download Now</NavLink>
            </p>

            <h3>
               To get in touch
              with our Legal Chat buddy
            </h3>
            <a href="http://34.83.85.78:8051/">Click ME</a>
            {/* Other case details go here */}
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default CaseDetail;
