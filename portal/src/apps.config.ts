export type AppMode = 'iframe' | 'newtab'

export interface AppEntry {
  id: string
  name: string
  description: string
  url: string
  mode: AppMode
}

// 各機能アプリをデプロイしたら、ここにエントリを追加してください。
// mode: 'iframe' はポータル内に埋め込み表示、'newtab' は別タブで開きます。
export const apps: AppEntry[] = [
  {
    id: 'app-game',
    name: '三目並べ',
    description: 'CPU対戦の三目並べゲーム',
    url: 'https://groupwork-app-game.nwkwbs.workers.dev',
    mode: 'iframe',
  },
]
