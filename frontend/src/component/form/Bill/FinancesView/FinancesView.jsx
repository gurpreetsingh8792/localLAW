import React from 'react'
import style from "./FinancesView.module.css"
import { NavLink } from 'react-router-dom'

const FinancesView = () => {
  return (
    <div className={style.MainContainer}>
    <div className={style.Container}>
        <h1>Finances Views</h1>

            <ul className={style.Caselinks}>
                <li><NavLink to={'/dashboard/billformdata'}>View Bills</NavLink></li>
                <li><NavLink to={"/dashboard/invoicesformdata"}>View Invoices</NavLink></li>
            </ul>
    </div>
        </div>
  )
}

export default FinancesView