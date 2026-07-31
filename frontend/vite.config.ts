import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 0.0.0.0で待ち受ける。localhostからもスマホ実機からも同じプロセスで届く。
    // IPを決め打ちすると、テザリングを切った瞬間にそのアドレスがPCから消えて
    // localhost まで含めて繋がらなくなるので、ここは true のままにすること。
    host: true,

    // /api だけをバックエンドへ中継する。
    // これがあるとスマホからのリクエストは http://<PCのIP>:5173/api/... という
    // 同一オリジンの宛先になり、Viteが同じPC上の8000番へ渡してくれる。
    // 実機確認のたびに .env のIPを書き換える必要がなくなり、
    // 同一オリジンなのでCORSのプリフライトも発生しない。
    proxy: {
      '/api': {
        // localhostだとWindowsではIPv6(::1)側へ先に繋ぎにいって空振りする
        // ことがあるため、127.0.0.1を明示する
        target: 'http://127.0.0.1:8000',
      },
    },
  },
})
