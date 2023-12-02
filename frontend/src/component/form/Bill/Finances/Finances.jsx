import React from 'react'
import style from './Finances.module.css'
import { NavLink } from 'react-router-dom'

const Finances = () => {
  return (
    <div className={style.MainContainer}>
    <div className={style.Container}>
        <h1>Finances</h1>

            <ul className={style.Caselinks}>
                <li><NavLink to={'/dashboard/billform'}>Add Bills</NavLink></li>
                <li><NavLink to={"/dashboard/invoicesform"}>Add Invoices</NavLink></li>
                
            </ul>
    </div>
        </div>
  )
}

export default Finances