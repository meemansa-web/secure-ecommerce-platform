import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import VendorNavbar from '../components/vendor/VendorNavbar'
import VendorSidebar from '../components/vendor/VendorSidebar'
import './VendorLayout.css'

export default function VendorLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const toggleSidebar = () => {
    setMobileNavOpen((prev) => !prev)
  }

  const closeSidebar = () => {
    setMobileNavOpen(false)
  }

  return (
    <div className="vendor-layout-root">
      <VendorNavbar
        onToggleSidebar={toggleSidebar}
        mobileNavOpen={mobileNavOpen}
      />

      <div className="vendor-layout-workspace">
        <VendorSidebar
          mobileOpen={mobileNavOpen}
          onCloseMobile={closeSidebar}
        />

        <main className="vendor-main-stage">
          <div className="vendor-stage-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
