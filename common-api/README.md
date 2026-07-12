# common-api

Supabaseのメール＋パスワード認証をラップするCloudflare Workers API。`portal`など各機能アプリから共通の認証バックエンドとして呼び出す想定。

## エンドポイント

- `POST /auth/signup` — `{ email, password }` → `{ user, session }`
- `POST /auth/login` — `{ email, password }` → `{ user, session }`
- `POST /auth/logout` — `{ access_token, refresh_token }` → `{ ok: true }`

エラー時は `{ error: string }` を返す。

## セットアップ

1. [Supabase](https://supabase.com/)でプロジェクトを作成し、Project URLとanon keyを控える
2. `.dev.vars.example` を `.dev.vars` にコピーし、`SUPABASE_URL` / `SUPABASE_ANON_KEY` を設定
3. `npm install`
4. `npm run dev` でローカル起動(既定で `http://localhost:8787`)

## デプロイ

```
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
npm run deploy
```

デプロイ後のURLを `portal` の `.env` の `VITE_COMMON_API_URL` に設定し、[src/cors.ts](src/cors.ts) の `ALLOWED_ORIGINS` にportalの本番URLが含まれていることを確認する。
