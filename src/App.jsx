import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { Sparkles, Settings, History, Zap } from 'lucide-react'
import GeneratePage from './pages/GeneratePage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import './App.css'

function NavBar() {
  const loc = useLocation()
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="nav-logo"><Zap size={18} /></div>
        <span className="nav-title">AI Blog Studio</span>
      </div>
      <div className="nav-links">
        <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} end>
          <Sparkles size={16} /> Generate
        </NavLink>
        <NavLink to="/history" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <History size={16} /> History
        </NavLink>
        <NavLink to="/settings" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={16} /> Settings
        </NavLink>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<GeneratePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
