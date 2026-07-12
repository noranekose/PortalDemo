import { useState } from 'react'
import './App.css'
import { apps } from './apps.config'
import type { AppEntry } from './apps.config'
import LoginForm from './components/LoginForm'
import { logout } from './lib/authApi'
import type { AuthSession } from './lib/authApi'
import { loadSession, saveSession, clearSession } from './lib/session'
import type { StoredSession } from './lib/session'

function App() {
  const [session, setSession] = useState<StoredSession | null>(() => loadSession())
  const [activeApp, setActiveApp] = useState<AppEntry | null>(null)

  const handleAuthenticated = (authSession: AuthSession, email: string) => {
    const stored: StoredSession = { ...authSession, email }
    saveSession(stored)
    setSession(stored)
  }

  const handleLogout = async () => {
    if (session) {
      await logout(session).catch(() => {})
    }
    clearSession()
    setSession(null)
    setActiveApp(null)
  }

  const handleSelect = (app: AppEntry) => {
    if (app.mode === 'newtab') {
      window.open(app.url, '_blank', 'noopener,noreferrer')
      return
    }
    setActiveApp(app)
  }

  if (!session) {
    return <LoginForm onAuthenticated={handleAuthenticated} />
  }

  return (
    <div id="portal-layout">
      <aside id="app-sidebar">
        <header id="portal-header">
          <h1>統合ポータル</h1>
          <p>各機能アプリへのエントリーポイントです</p>
          <div id="portal-user">
            <span>{session.email}</span>
            <button type="button" onClick={handleLogout}>
              ログアウト
            </button>
          </div>
        </header>

        <nav id="app-list">
          {apps.length === 0 ? (
            <p className="empty">利用可能な機能アプリがまだ登録されていません。</p>
          ) : (
            apps.map((app) => (
              <button
                key={app.id}
                type="button"
                className={
                  'app-card' + (activeApp?.id === app.id ? ' active' : '')
                }
                onClick={() => handleSelect(app)}
              >
                <h2>{app.name}</h2>
                <p>{app.description}</p>
                <span className="mode-badge">
                  {app.mode === 'iframe' ? '埋め込み表示' : '新規タブで開く'}
                </span>
              </button>
            ))
          )}
        </nav>
      </aside>

      <main id="app-viewer">
        {activeApp ? (
          <iframe src={activeApp.url} title={activeApp.name} />
        ) : (
          <p className="viewer-placeholder">
            左のリストからアプリを選択してください
          </p>
        )}
      </main>
    </div>
  )
}

export default App
