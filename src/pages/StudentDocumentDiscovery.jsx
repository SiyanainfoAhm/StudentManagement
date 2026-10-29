import React, { useEffect, useState } from 'react'

const TYPES = [
  { id: 'passport', label: 'Passport', re: /passport|travel.document/i },
  { id: 'licence', label: 'Driving licence', re: /driv(e|ing).?licen[cs]e|driver.?licen[cs]e/i },
  { id: 'visa', label: 'Visa copy', re: /visa|vevo|immigration/i },
  { id: 'academic', label: 'Academic records', re: /transcript|certificate|diploma|degree|marksheet|academic|school/i },
]
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export function StudentDocumentDiscovery() {
  const [consent, setConsent] = useState(false)
  const [ready, setReady] = useState(false)
  const [token, setToken] = useState(null)
  const [files, setFiles] = useState([])
  const [picked, setPicked] = useState({})
  const [manual, setManual] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    if (window.google?.accounts?.oauth2) { setReady(true); return }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => setReady(true)
    script.onerror = () => setError('Google sign-in could not load.')
    document.body.appendChild(script)
    return () => { script.remove() }
  }, [])
  async function discover(accessToken) {
    setBusy(true); setError(''); setFiles([])
    try {
      let pageToken = '', all = [], pages = 0
      do {
        const params = new URLSearchParams({
          q: "trashed = false and (mimeType = 'application/pdf' or mimeType contains 'image/' or mimeType = 'application/vnd.google-apps.document')",
          fields: 'nextPageToken,files(id,name,mimeType,webViewLink,description)',
          pageSize: '100',
        })
        if (pageToken) params.set('pageToken', pageToken)
        const response = await fetch('https://www.googleapis.com/drive/v3/files?' + params, {
          headers: { Authorization: 'Bearer ' + accessToken },
        })
        if (!response.ok) throw new Error('Google Drive request failed (' + response.status + '). Check OAuth configuration and permissions.')
        const data = await response.json()
        all.push(...(data.files || []))
        pageToken = data.nextPageToken || ''
        pages++
      } while (pageToken && pages < 10)
      setFiles(all.map(file => ({
        ...file,
        category: TYPES.find(type => type.re.test(file.name + ' ' + (file.description || '')))?.id || 'other',
      })))
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }
  function connect() {
    if (!consent) return setError('Please consent before connecting.')
    if (!CLIENT_ID) return setError('Google OAuth is not configured. Set VITE_GOOGLE_CLIENT_ID for this deployment.')
    if (!ready) return setError('Google sign-in is still loading.')
    window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive.metadata.readonly',
      callback: response => {
        if (response.error || !response.access_token) return setError(response.error || 'Google authorisation was cancelled.')
        setToken(response.access_token)
        discover(response.access_token)
      },
    }).requestAccessToken({ prompt: 'consent' })
  }
  function disconnect() {
    if (token && window.google?.accounts?.oauth2) window.google.accounts.oauth2.revoke(token, () => {})
    setToken(null); setFiles([]); setPicked({})
  }
  const suggested = files.filter(f => f.category !== 'other')
  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
    <div className="mx-auto max-w-2xl space-y-5">
      <header className="rounded-2xl bg-indigo-950 p-7 text-white">
        <p className="text-sm font-semibold tracking-widest">SLIT · STUDENT DOCUMENTS</p>
        <h1 className="mt-3 text-3xl font-bold">Provide your documents</h1>
        <p className="mt-2 text-indigo-100">Find likely documents in your Google Drive or select files from your phone. You approve every document.</p>
      </header>
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Find documents in Google Drive</h2>
        <p className="mt-2 text-sm text-slate-600">With your permission, we inspect Drive file names and descriptions to suggest passports, driving licences, visas and academic records. This version does not read file contents, scan Gmail or upload files.</p>
        <label className="mt-4 flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1" checked={consent} onChange={e => setConsent(e.target.checked)} /> I authorise a one-time search of Google Drive file metadata for document suggestions. I will review each result before sharing anything.</label>
        <div className="mt-4 flex flex-wrap gap-3">
          <button disabled={!consent || busy} onClick={connect} className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-40">{busy ? 'Searching…' : 'Connect Google Drive & find documents'}</button>
          {token && <button onClick={disconnect} className="rounded-xl border px-4 py-3">Disconnect</button>}
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        {token && !busy && <p className="mt-3 text-sm text-slate-600">Found {suggested.length} likely matches from {files.length} indexed files. Suggestions use filenames, not AI content analysis.</p>}
        {suggested.map(f => <label key={f.id} className="mt-3 flex items-start gap-3 rounded-xl border p-3">
          <input type="checkbox" checked={!!picked[f.id]} onChange={e => setPicked(old => ({ ...old, [f.id]: e.target.checked }))} />
          <span className="min-w-0 flex-1"><span className="block break-words font-medium">{f.name}</span><span className="text-xs text-slate-500">{TYPES.find(t => t.id === f.category)?.label}</span></span>
          {f.webViewLink && <a className="text-sm text-indigo-600 underline" href={f.webViewLink} target="_blank" rel="noreferrer">View</a>}
        </label>)}
      </section>
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Or choose files from your phone</h2>
        <input className="mt-4 block w-full text-sm" type="file" multiple accept="image/*,.pdf" onChange={e => setManual(Array.from(e.target.files || []))} />
        <p className="mt-2 text-sm text-slate-500">{manual.length} local files selected.</p>
      </section>
      <section className="rounded-2xl border bg-white p-6">
        <h2 className="font-semibold">Review</h2>
        <p className="mt-2 text-sm text-slate-600">{Object.values(picked).filter(Boolean).length} Drive suggestions selected; {manual.length} local files selected.</p>
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Preview only. No documents are uploaded. A secure student-specific submission backend must be connected before this can be used for real enrolments.</p>
      </section>
    </div>
  </main>
}
