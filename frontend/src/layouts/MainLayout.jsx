import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import './MainLayout.css'

export default function MainLayout() {
  return (
    <div className="main-layout-root">
      <Navbar />
      <main className="main-layout-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
