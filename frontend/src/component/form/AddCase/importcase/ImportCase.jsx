import React from 'react'
import style from './ImportCase.module.css'
import { NavLink } from 'react-router-dom'
import DashboardNavbar from '../../../utilities/DashboardNavbar/DashboardNavbar'

const ImportCase = () => {
    return (
        <div className={style.Container}>
        <DashboardNavbar />
        <div className={style.MainContainer}>
            <div className={style.ContainerLeft}>
                <h1>Fill Manully</h1>

                <ul className={style.Caselinks}>
                    <li><NavLink to={'/dashboard/caseform'}>Add Case Manully</NavLink></li>

                </ul>
            </div>

            <div className={style.ContainerRight}>
                <h1>Import Case</h1>

                <ul className={style.Caselinks}>
                    <li><NavLink to={"/cnrform"}>Cnr Search</NavLink></li>
                    <li><NavLink to={"/partynameform"}>Party Search</NavLink></li>
                    <li><NavLink to={"/advocateform"}>Advocate Search</NavLink></li>
                </ul>
            </div>
        </div>
        </div>
    )
}

export default ImportCase