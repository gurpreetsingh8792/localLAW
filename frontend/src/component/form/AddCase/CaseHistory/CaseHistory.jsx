import React from 'react'
import style from './CaseHistory.module.css'

const data = [
    {
      hearingDate: '16-May-2019',
      heardJudges: 'Kent Silvia',
      hearingResult: 'Postponed Without Date',
      hearingJudgement: 'Land Paper of opposite client side was not clarity. Get some strong evidence against opposite client.',
    },
    {
      hearingDate: '16-May-2019',
      heardJudges: 'Kent Silvia',
      hearingResult: 'Postponed Without Date',
      hearingJudgement: 'Land Paper of opposite client side was not clarity. Get some strong evidence against opposite client.',
    },
    {
      hearingDate: '16-May-2019',
      heardJudges: 'Kent Silvia',
      hearingResult: 'Postponed Without Date',
      hearingJudgement: 'Land Paper of opposite client side was not clarity. Get some strong evidence against opposite client.',
    },
    // ... Add the rest of the data here
  ];

const CaseHistory = () => {
  return (
    <div className={style.TimelineTableContainer}>
    <h2 className={style.Heading}>2000537DM - Kerry Lam — Real estate transaction</h2>
    <table className={style.TimelineTable}>
      <thead className={style.Thead}>
        <tr className={style.Tr}>
          <th className={style.Th}>Hearing Date</th>
          <th className={style.Th}>Heard Judges</th>
          <th className={style.Th}>Hearing Result</th>
          <th className={style.Th}>Hearing Judgment</th>
        </tr>
      </thead>
      <tbody>
        {data.map((entry, index) => (
          <tr key={index}>
            <td className={style.Td}>{entry.hearingDate}</td>
            <td className={style.Td}>{entry.heardJudges}</td>
            <td className={style.Td}>{entry.hearingResult}</td>
            <td className={style.Td}>{entry.hearingJudgement}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  )
}

export default CaseHistory