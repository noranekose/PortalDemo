import { useState } from 'react'
import type { FormEvent } from 'react'
import { login, signUp } from '../lib/authApi'
import type { AuthSession } from '../lib/authApi'

interface Props {
  onAuthenticated: (session: AuthSession, email: string) => void
}

function LoginForm({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setSubmitting(true)
    try {
      const result = mode === 'login' ? await login(email, password) : await signUp(email, password)
      if (!result.session) {
        setNotice('確認メールを送信しました。メール内のリンクから認証を完了してください。')
        return
      }
      onAuthenticated(result.session, email)
    } catch (err) {
      setError(err instanceof Error ? err.message : '認証に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div id="login-screen">
      <form id="login-form" onSubmit={handleSubmit}>
        <h1>統合ポータル</h1>
        <p>{mode === 'login' ? 'ログインしてください' : '新規アカウントを作成'}</p>

        <label>
          メールアドレス
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label>
          パスワード
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={6}
            required
          />
        </label>

        {error && <p className="login-message login-error">{error}</p>}
        {notice && <p className="login-message login-notice">{notice}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? '処理中...' : mode === 'login' ? 'ログイン' : 'サインアップ'}
        </button>

        <button
          type="button"
          className="login-switch"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login')
            setError(null)
            setNotice(null)
          }}
        >
          {mode === 'login' ? 'アカウントをお持ちでない方はこちら' : 'ログイン画面に戻る'}
        </button>
      </form>
    </div>
  )
}

export default LoginForm
