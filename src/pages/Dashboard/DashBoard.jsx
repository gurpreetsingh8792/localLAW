import React from 'react'
import Headers from '../../component/utilities/Header/Headers'
import Footer from '../../component/utilities/footer/footer'
import image from '../../assets/dashboard.jpg'
import SideNav from '../../component/utilities/SideNavBar/SideNav'

const DashBoard = () => {
  return (
    <>
    <Headers title="Dashboard" image={image}>
        <p style={{ color: "white" }}>
          
        </p>
      </Headers>
      <SideNav/>
      <Footer/>
    </>
  )
}

export default DashBoard