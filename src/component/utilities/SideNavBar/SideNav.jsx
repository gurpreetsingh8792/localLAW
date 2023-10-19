import React from 'react'
import { NavLink } from 'react-router-dom'
import Explore from '../../../pages/Explore/Explore'
import {sideNavLinks} from './data'
// import style from "./sidenav.module.css"

const SideNav = () => {
  return (
    <>
    <ul>
      {sideNavLinks.map(({name,path}, index)=>(
        <li key={index}>
          <NavLink to={path} >
            {name}
          </NavLink>
        </li>
      ))}
    </ul>
    {/* <NavLink to={'/explore'}>Explore</NavLink> */}
    </>
  )
}

export default SideNav