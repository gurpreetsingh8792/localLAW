// import React from 'react'
// import style from './Result.module.css'
// import { NavLink } from 'react-router-dom'
// import { useState } from 'react'

// const Results = () => {
//   const [results, setResults] = useState([]);

//   return (
//     <>
//         <div className={style.resultContainer}>
//           <h2 className={style.resultTitle}>Results:</h2>
//           {/* <h3 className={style.searchTerm}>{searchTerm}</h3> */}

//           <div className={style.tableHeader}>
//             <div>Case Number</div>
//             <div>Classifier</div>
//           </div>

//           {results?.map((item, index) => (
//             <div className={style.tableRow} key={index}>
//               <NavLink
//                 to={`/case/${item.case_no}`}
//                 className={style.tableDataLink}
//               >
//                 <div>{item.case_no}</div>
//               </NavLink>
              
//               <div>{item.classifier}</div>
//             </div>
//           ))}

//         </div>
//     </>
//   )
// }

// export default Results