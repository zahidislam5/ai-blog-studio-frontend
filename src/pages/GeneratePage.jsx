import React, { useState, useEffect, useRef } from 'react'
import { Sparkles, Zap, Image, FileText, Upload, CheckCircle, XCircle, Loader, ExternalLink, AlertTriangle } from 'lucide-react'
import { api, settingsStorage } from '../api.js'
import './GeneratePage.css'

const STEPS = [
  { id: 'content', icon: FileText, label: 'Writing SEO Content', desc: 'Claude AI is crafting your blog post...' },
  { id: 'images', icon: Image, label: 'Generating Images', desc: 'Gemini AI is creating visuals...' },
  { id: 'upload', icon: Upload, label: 'Uploading to WordPress', desc: 'Images uploading to media library...' },
  { id: 'publish', icon: CheckCircle, label: 'Publishing Draft', desc: 'Saving post to WordPress...' },
]

function getStepFromProgress(progress) {
  if (progress < 20) return 0
  if (progress < 60) return 1
  if (progress < 80) return 2
  return 3
}

export default function GeneratePage() {
  const [topic, setTopic] = useState('')
  const [imageCount, setImageCount] = useState(20)
  const [jobId, setJobId] = useState(null)
  const [job, setJob] = useState(null)
  const [polling, setPolling] = useState(false)
  const [error, setError] = useState('')
  const logsRef = useRef(null)
  const settings = settingsStorage.get()
  const hasSettings = settings.anthropic_api_key && settings.gemini_api_key && settings.wp_url

  // Poll job status
  useEffect(() => {
    if (!jobId || !polling) return
    const interval = setInterval(async () => {
      try {
        const data = await api.getJob(jobId)
        setJob(data)
        if (data.status === 'done' || data.status === 'error') {
          setPolling(false)
        }
      } catch (e) {
        console.error(e)
      }
    }, 1500)
    return () => clearInterval(interval)
  }, [jobId, polling])

  // Auto scroll logs
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight
    }
  }, [job?.logs])

  const handleGenerate = async () => {
    if (!topic.trim()) return setError('Please enter a topic!')
    if (!hasSettings) return setError('Please configure your API keys in Settings first.')
    setError('')
    setJob(null)
    setJobId(null)

    try {
      const { job_id } = await api.generate(topic, imageCount, settings)
      setJobId(job_id)
      setPolling(true)
      setJob({ status: 'pending', progress: 0, current_step: 'Starting...', logs: [] })
    } catch (e) {
      setError(`Failed to start: ${e.message}`)
    }
  }

  const handleReset = () => {
    setJob(null)
    setJobId(null)
    setPolling(false)
    setTopic('')
    setError('')
  }

  const isRunning = job && (job.status === 'running' || job.status === 'pending')
  const isDone = job?.status === 'done'
  const isError = job?.status === 'error'
  const currentStep = job ? getStepFromProgress(job.progress || 0) : -1

  return (
    <div className="page-inner">
      <div className="page-header">
        <h1>Generate Blog Post</h1>
        <p>Enter a topic — AI will write, illustrate, and publish to WordPress automatically.</p>
      </div>

      {!hasSettings && (
        <div className="alert alert-warn">
          <AlertTriangle size={16} />
          <span>API keys not configured. <a href="/settings" className="alert-link">Go to Settings →</a></span>
        </div>
      )}

      {/* Input Card */}
      {!isRunning && !isDone && (
        <div className="card">
          <div className="card-title">New Blog Post</div>

          <div className="field">
            <label>Topic or Title</label>
            <textarea
              className="input"
              placeholder="e.g. Best Mehndi Design for Eid 2026&#10;Simple Arabic Mehndi Ideas for Beginners&#10;Bridal Mehndi Designs Trending This Year"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              rows={3}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleGenerate() }}
            />
            <span className="field-hint">Press Ctrl+Enter to generate</span>
          </div>

          <div className="field">
            <label>Number of Images</label>
            <div className="image-count-row">
              {[10, 15, 20, 25].map(n => (
                <button
                  key={n}
                  className={`count-btn ${imageCount === n ? 'active' : ''}`}
                  onClick={() => setImageCount(n)}
                >
                  {n} images
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="alert alert-error" style={{marginBottom: 16}}>
              <XCircle size={15}/> {error}
            </div>
          )}

          <button className="btn btn-primary btn-full generate-btn" onClick={handleGenerate} disabled={!topic.trim() || !hasSettings}>
            <Sparkles size={18} />
            Generate Blog Post
          </button>
        </div>
      )}

      {/* Progress Card */}
      {(isRunning || isDone || isError) && (
        <div className="progress-card">
          {/* Header */}
          <div className="progress-header">
            <div>
              <div className="progress-topic">{topic}</div>
              <div className="progress-sub">
                {isRunning && <span className="badge badge-yellow"><Loader size={11} className="spin"/> Running</span>}
                {isDone && <span className="badge badge-green"><CheckCircle size={11}/> Complete</span>}
                {isError && <span className="badge badge-red"><XCircle size={11}/> Failed</span>}
              </div>
            </div>
            {(isDone || isError) && (
              <button className="btn btn-secondary btn-sm" onClick={handleReset}>New Post</button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="prog-bar-wrap">
            <div className="prog-bar-track">
              <div
                className={`prog-bar-fill ${isDone ? 'done' : isError ? 'error' : ''}`}
                style={{ width: `${job?.progress || 0}%` }}
              />
            </div>
            <span className="prog-pct">{job?.progress || 0}%</span>
          </div>

          {/* Steps */}
          <div className="steps-row">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              const done = isDone || i < currentStep
              const active = !isDone && !isError && i === currentStep
              const err = isError && i === currentStep
              return (
                <div key={step.id} className={`step-item ${done ? 'done' : active ? 'active' : err ? 'error' : 'idle'}`}>
                  <div className="step-icon">
                    {done ? <CheckCircle size={15}/> : err ? <XCircle size={15}/> : active ? <Loader size={15} className="spin"/> : <Icon size={15}/>}
                  </div>
                  <div className="step-text">
                    <div className="step-label">{step.label}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Current step text */}
          {isRunning && (
            <div className="current-step-text">
              <Zap size={13}/> {job.current_step}
            </div>
          )}

          {/* Result */}
          {isDone && job.result && (
            <div className="result-box">
              <div className="result-title">🎉 Post Published as Draft!</div>
              <div className="result-meta">
                <div className="result-row"><span>Title</span><strong>{job.result.title}</strong></div>
                <div className="result-row"><span>Post ID</span><strong>#{job.result.post_id}</strong></div>
                <div className="result-row"><span>Images</span><strong>{job.result.images_uploaded} uploaded</strong></div>
              </div>
              <a href={job.result.preview_link} target="_blank" rel="noopener" className="btn btn-primary" style={{marginTop: 16}}>
                <ExternalLink size={15}/> Preview Draft in WordPress
              </a>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="alert alert-error" style={{marginTop: 16}}>
              <XCircle size={15}/> {job.error}
            </div>
          )}

          {/* Logs */}
          <div className="logs-section">
            <div className="logs-header">Live Logs</div>
            <div className="logs-body" ref={logsRef}>
              {(job?.logs || []).map((log, i) => (
                <div key={i} className={`log-line ${log.includes('✅') ? 'log-ok' : log.includes('❌') || log.includes('⚠️') ? 'log-warn' : ''}`}>
                  {log}
                </div>
              ))}
              {isRunning && <div className="log-line log-cursor">▋</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
