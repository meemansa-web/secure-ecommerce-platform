import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminNavbar from '../components/admin/AdminNavbar'
import AdminSidebar from '../components/admin/AdminSidebar'
import './AdminLayout.css'

export default function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const toggleSidebar = () => {
    setMobileNavOpen((prev) => !prev)
  }

  const closeSidebar = () => {
    setMobileNavOpen(false)
  }

  return (
    <div className="admin-layout-root">
      <AdminNavbar
        onToggleSidebar={toggleSidebar}
        mobileNavOpen={mobileNavOpen}
      />

      <div className="admin-layout-workspace">
        <AdminSidebar
          mobileOpen={mobileNavOpen}
          onCloseMobile={closeSidebar}
        />

        <main className="admin-main-stage">
          <div className="admin-stage-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
