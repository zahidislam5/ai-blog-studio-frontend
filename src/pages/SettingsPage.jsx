import React, { useState, useEffect } from 'react'
import { Save, Eye, EyeOff, CheckCircle, XCircle, Loader, Trash2, Shield } from 'lucide-react'
import { settingsStorage, api } from '../api.js'
import './SettingsPage.css'

export default function SettingsPage() {
  const [form, setForm] = useState({
    anthropic_api_key: '',
    gemini_api_key: '',
    wp_url: '',
    wp_username: '',
    wp_password: '',
  })
  const [show, setShow] = useState({ anthropic: false, gemini: false, wp: false })
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  useEffect(() => {
    const s = settingsStorage.get()
    if (s) setForm(prev => ({ ...prev, ...s }))
  }, [])

  const handleChange = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }))
    setSaved(false)
    setTestResult(null)
  }

  const handleSave = () => {
    settingsStorage.save(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleClear = () => {
    settingsStorage.clear()
    setForm({ anthropic_api_key: '', gemini_api_key: '', wp_url: '', wp_username: '', wp_password: '' })
    setTestResult(null)
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    const result = await api.testWordPress(form)
    setTestResult(result)
    setTesting(false)
  }

  const toggle = (key) => setShow(prev => ({ ...prev, [key]: !prev[key] }))

  const hasAll = form.anthropic_api_key && form.gemini_api_key && form.wp_url && form.wp_username && form.wp_password
  const keyCount = [form.anthropic_api_key, form.gemini_api_key, form.wp_url, form.wp_username, form.wp_password].filter(Boolean).length

  return (
    <div className="page-inner">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure your API keys and WordPress credentials. Saved locally in your browser.</p>
      </div>

      {/* Security note */}
      <div className="security-note">
        <Shield size={15}/>
        <span>Your credentials are stored only in your browser's localStorage. They are never sent to any server except when making API calls directly to Anthropic, Google, and your WordPress site.</span>
      </div>

      {/* Status */}
      <div className="settings-status">
        <div className="status-dots">
          {[
            { key: 'anthropic_api_key', label: 'Claude API' },
            { key: 'gemini_api_key', label: 'Gemini API' },
            { key: 'wp_url', label: 'WordPress' },
            { key: 'wp_username', label: 'WP User' },
            { key: 'wp_password', label: 'WP Password' },
          ].map(item => (
            <div key={item.key} className={`status-dot ${form[item.key] ? 'set' : 'unset'}`}>
              <div className="dot"/>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="status-pct">{keyCount}/5 configured</div>
      </div>

      {/* Claude */}
      <div className="card">
        <div className="card-title">🤖 Claude API (Anthropic)</div>
        <p className="settings-desc">Used for writing SEO content. Get your key at <a href="https://console.anthropic.com" target="_blank" className="ext-link">console.anthropic.com</a></p>
        <div className="field" style={{marginTop: 16}}>
          <label>API Key</label>
          <div className="input-with-toggle">
            <input
              type={show.anthropic ? 'text' : 'password'}
              className="input input-password"
              placeholder="sk-ant-api03-..."
              value={form.anthropic_api_key}
              onChange={e => handleChange('anthropic_api_key', e.target.value)}
            />
            <button className="toggle-btn" onClick={() => toggle('anthropic')}>
              {show.anthropic ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          </div>
        </div>
      </div>

      {/* Gemini */}
      <div className="card">
        <div className="card-title">🖼️ Gemini API (Google)</div>
        <p className="settings-desc">Used for generating images. Get your key at <a href="https://aistudio.google.com/app/apikey" target="_blank" className="ext-link">aistudio.google.com</a></p>
        <div className="field" style={{marginTop: 16}}>
          <label>API Key</label>
          <div className="input-with-toggle">
            <input
              type={show.gemini ? 'text' : 'password'}
              className="input input-password"
              placeholder="AIzaSy..."
              value={form.gemini_api_key}
              onChange={e => handleChange('gemini_api_key', e.target.value)}
            />
            <button className="toggle-btn" onClick={() => toggle('gemini')}>
              {show.gemini ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          </div>
        </div>
      </div>

      {/* WordPress */}
      <div className="card">
        <div className="card-title">🌐 WordPress</div>
        <p className="settings-desc">
          Your WordPress site credentials. For password, use an <strong>Application Password</strong>:<br/>
          WP Admin → Users → Your Profile → scroll down → Application Passwords → Create new
        </p>

        <div className="field" style={{marginTop: 16}}>
          <label>Site URL</label>
          <input
            type="url"
            className="input"
            placeholder="https://yoursite.com"
            value={form.wp_url}
            onChange={e => handleChange('wp_url', e.target.value)}
          />
        </div>

        <div className="wp-creds-row">
          <div className="field">
            <label>Username</label>
            <input
              type="text"
              className="input"
              placeholder="admin"
              value={form.wp_username}
              onChange={e => handleChange('wp_username', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Application Password</label>
            <div className="input-with-toggle">
              <input
                type={show.wp ? 'text' : 'password'}
                className="input input-password"
                placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                value={form.wp_password}
                onChange={e => handleChange('wp_password', e.target.value)}
              />
              <button className="toggle-btn" onClick={() => toggle('wp')}>
                {show.wp ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>
        </div>

        {/* Test connection */}
        <div className="test-row">
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleTest}
            disabled={testing || !form.wp_url || !form.wp_username || !form.wp_password}
          >
            {testing ? <><Loader size={13} className="spin"/> Testing...</> : 'Test Connection'}
          </button>
          {testResult && (
            <div className={`test-result ${testResult.success ? 'ok' : 'err'}`}>
              {testResult.success ? <CheckCircle size={13}/> : <XCircle size={13}/>}
              {testResult.message}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="settings-actions">
        <button className="btn btn-primary" onClick={handleSave} disabled={!hasAll}>
          {saved ? <><CheckCircle size={16}/> Saved!</> : <><Save size={16}/> Save Settings</>}
        </button>
        <button className="btn btn-danger btn-sm" onClick={handleClear}>
          <Trash2 size={14}/> Clear All
        </button>
      </div>

      {/* Backend URL */}
      <div className="card" style={{marginTop: 32}}>
        <div className="card-title">⚙️ Backend Server</div>
        <p className="settings-desc">
          The backend API URL. After deploying to Render/Railway, update <code>VITE_API_URL</code> in your Vercel environment variables.
        </p>
        <div className="field" style={{marginTop: 14}}>
          <label>Current API URL</label>
          <input
            type="text"
            className="input"
            value={import.meta.env.VITE_API_URL || 'http://localhost:8000'}
            readOnly
            style={{opacity: 0.6}}
          />
          <span className="field-hint">Set via VITE_API_URL environment variable</span>
        </div>
      </div>
    </div>
  )
}
