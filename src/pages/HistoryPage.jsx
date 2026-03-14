import React, { useState, useEffect } from 'react'
import { History, CheckCircle, XCircle, Loader, ExternalLink, RefreshCw, Clock } from 'lucide-react'
import { api } from '../api.js'
import './HistoryPage.css'

export default function HistoryPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.getJobs()
      setJobs(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const statusBadge = (status, progress) => {
    if (status === 'done') return <span className="badge badge-green"><CheckCircle size={11}/> Done</span>
    if (status === 'error') return <span className="badge badge-red"><XCircle size={11}/> Failed</span>
    if (status === 'running') return <span className="badge badge-yellow"><Loader size={11} className="spin"/> Running {progress}%</span>
    return <span className="badge badge-purple"><Clock size={11}/> Pending</span>
  }

  return (
    <div className="page-inner">
      <div className="page-header">
        <h1>Job History</h1>
        <p>All blog generation jobs from this session.</p>
      </div>

      <div className="history-toolbar">
        <button className="btn btn-secondary btn-sm" onClick={load}>
          <RefreshCw size={14}/> Refresh
        </button>
        <span className="history-count">{jobs.length} jobs</span>
      </div>

      {loading && (
        <div className="history-empty"><Loader size={20} className="spin"/> Loading...</div>
      )}

      {!loading && jobs.length === 0 && (
        <div className="history-empty">
          <History size={40} style={{opacity: 0.2, marginBottom: 12}}/>
          <p>No jobs yet. Generate your first blog post!</p>
        </div>
      )}

      <div className="jobs-list">
        {jobs.map(job => (
          <div key={job.job_id} className={`job-card ${job.status}`}>
            <div className="job-main">
              <div className="job-topic">{job.topic}</div>
              <div className="job-meta">
                <span className="job-time">{job.created_at ? new Date(job.created_at).toLocaleString() : ''}</span>
                {statusBadge(job.status, job.progress)}
              </div>
            </div>
            {job.status === 'running' && (
              <div className="job-progress-mini">
                <div className="mini-bar-track">
                  <div className="mini-bar-fill" style={{width: `${job.progress}%`}}/>
                </div>
              </div>
            )}
            {job.status === 'done' && job.result && (
              <div className="job-result-row">
                <span className="job-result-info">
                  <CheckCircle size={12}/> {job.result.images_uploaded} images · Post #{job.result.post_id}
                </span>
                <a href={job.result?.preview_link} target="_blank" rel="noopener" className="btn btn-secondary btn-sm">
                  <ExternalLink size={12}/> Preview
                </a>
              </div>
            )}
            {job.status === 'error' && (
              <div className="job-error-row">
                <XCircle size={12}/> {job.error?.slice(0, 120)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
