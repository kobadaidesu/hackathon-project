# hackathon-project

## チーム開発ルール

- `main` ブランチには直接Pushしない
- 作業ごとに `feature/〇〇` などの作業用ブランチを作成する
- 作業完了後はPull Requestを作成する
- 他のメンバーの作業ファイルを無断で大きく変更しない
- 作業を始める前に `main` ブランチの最新内容を取り込む
- `.env` やAPIキーなどの秘密情報はPushしない
- Pull Requestは原則として1人以上の確認後にマージする

## 作業を始める前の手順

まず `main` を最新にします。

```bash
git switch main
git pull origin main
```

次に、作業用のブランチを作ります。

```bash
git switch -c feature/login
```

ブランチ名は作業内容に合わせて付けてください。

```text
feature/〇〇   新機能
fix/〇〇       バグ修正
chore/〇〇     設定・環境構築
docs/〇〇      ドキュメント修正
```

すでにあるブランチで作業を再開するときは、先に `main` を最新にしてから変更を取り込みます。

作業途中の変更が残っている場合は、先にコミットするか `stash` してからブランチを切り替えてください。

```bash
git switch main
git pull origin main
git switch feature/login
git merge main
```

`stash` した場合は、作業ブランチに戻ってから変更を戻します。

```bash
git stash pop
```

コンフリクトが出たときは、勝手に直さず一度チーム内で確認してください。

## 初回セットアップ

`.env` はPushされないので、クローン後に各自で作ります。

```bash
cd backend
cp .env.example .env
cd ../frontend
cp .env.example .env
```

`backend/.env` の `DATABASE_URL` だけは本物の値が必要です。こばだいに連絡してください。

## 開発サーバーの起動

バックエンドを起動します。

```bash
cd backend
.venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

macOSやLinuxの場合、仮想環境を有効にするコマンドは `source .venv/bin/activate` です。

**`--host` にはIPアドレスを直接書かないでください。** `--host 0.0.0.0` は「このPCが持っている全アドレスで待ち受ける」という意味で、`localhost` からもスマホ実機からも同じプロセスで届きます。ここを `--host 172.20.10.3` のように決め打ちすると、テザリングを切った瞬間にそのアドレスがPCから消え、`localhost` を含む全リクエストが `ERR_CONNECTION_TIMED_OUT` になります。プロセスは動いているように見えるので原因が分かりにくいです。

別のターミナルでフロントエンドを起動します。

```bash
cd frontend
npm install
npm run dev
```

`http://localhost:5173` が開けば成功です。5173が埋まっていると5174などになりますが、CORSはポートを問わない設定なのでそのまま動きます。

## スマホ実機で確認する

**`.env` の書き換えは不要です。** 通常どおり両方のサーバーを起動したうえで、以下だけ行います。

1. USBテザリング(iPhone)でPCとスマホを繋ぐ
2. `ipconfig` でPCに付いたIPアドレスを確認する(テザリング中は `172.20.10.x` になります)
3. スマホのブラウザで `http://<PCのIP>:5173` を開く

これで動くのは、フロントエンドがAPIを `/api/...` という相対パスで叩いているためです。スマホから見た宛先は `http://<PCのIP>:5173/api/...` になり、Viteが同じPC上の `127.0.0.1:8000` へ中継します(`vite.config.ts` の `server.proxy`)。スマホにPCのIPを教える必要がないので、ケーブルを抜くたびに設定を戻す作業も要りません。

副次的な効果として、スマホからのリクエストも同一オリジン扱いになるためCORSのプリフライトが発生しません。

### 繋がらないときは

- **PCのブラウザでは開けるのにスマホからは開けない** … Windowsファイアウォールが5173番の受信を止めている可能性があります。初回は「Node.js がネットワークへのアクセスを要求しています」というダイアログが出るので、**プライベートネットワーク**にチェックを入れて許可してください。ダイアログを一度拒否している場合は、`Windows セキュリティ` → `ファイアウォールとネットワーク保護` → `アプリにファイアウォール経由の通信を許可する` から Node.js を探して許可し直します。
- **画面は出るがAPIだけ失敗する** … バックエンドが起動していないか、8000番以外で動いています。ポートを変えた場合は `vite.config.ts` の `target` も合わせてください。
- `ipconfig` で `172.20.10.x` が出てこない … テザリングが有効になっていません。iPhone側で「インターネット共有」をオンにしてから繋ぎ直してください。

## デプロイ

フロントエンドを **Vercel**、バックエンドを **Render** に置きます。DB・認証・画像は既に稼働している Supabase をそのまま使うので、**Supabase 側の設定変更は不要**です(Confirm email がOFFでメールのリダイレクトを使っておらず、Storageのバケットも公開済みのため)。

ブラウザは画面を Vercel から、APIを Render から直接取得します。画像アップロードが Vercel を経由しないので、サーバーレス特有のリクエストサイズ上限を気にせずに済みます。

```
ブラウザ ──────────→ Vercel（画面）
    └──────────────→ Render（API） ──→ Supabase（DB・画像）
```

### 1. バックエンド(Render)

先にこちらを済ませます。RenderのURLが決まらないとVercel側の設定を入れられないためです。

1. Render で **New → Blueprint** を選び、このリポジトリを指定する
2. リポジトリ直下の `render.yaml` が読み込まれ、起動コマンドやPythonバージョンは自動で入る
3. 入力を求められる2つに値を入れる(秘密情報なのでリポジトリには置いていません)
   - `DATABASE_URL` … `backend/.env` と同じ値
   - `SUPABASE_SERVICE_KEY` … `backend/.env` と同じ値
4. デプロイ後、発行された `https://xxx.onrender.com` を控える
5. `curl https://xxx.onrender.com/api/health` が `{"status":"ok"}` を返せば成功

`region: singapore` が使えないと言われたら、`render.yaml` からその1行を消してください(既定のオレゴンになります)。

### 2. フロントエンド(Vercel)

1. Vercel で **New Project** を選び、このリポジトリを指定する
2. **Root Directory を `frontend` に設定する**(ここを忘れるとビルドが失敗します)
3. 環境変数を3つ登録する

   | 名前 | 値 |
   |---|---|
   | `VITE_API_BASE_URL` | 手順1で控えた `https://xxx.onrender.com` |
   | `VITE_SUPABASE_URL` | `frontend/.env.example` と同じ値 |
   | `VITE_SUPABASE_ANON_KEY` | `frontend/.env.example` と同じ値 |

4. デプロイ

`VITE_API_BASE_URL` を空のままにすると、APIを相対パスで叩いてVercel上の存在しないパスへ行くため、ログイン以外がすべて失敗します。開発時の `vite.config.ts` の proxy は開発サーバー専用で、`vite build` には効きません。

### 動作確認

1. Vercel のURLを開いてログインできる
2. タイムラインが表示される(CORSと認証が通っている証拠)
3. **`/recruitments/<id>` を直接開いてリロードしても404にならない**(SPAフォールバックの確認)
4. 画像付きで投稿できる

### 知っておくべきこと

- **Render の無料プランは15分アクセスが無いとスリープし、復帰に50秒前後かかります。** 発表やデモの直前に一度URLを叩いて起こしておいてください。最初の1回だけ極端に遅く、以降は普通に動きます。
- **Vercelはコミットごとにプレビュー用の別URLを発行します。** `backend/app/main.py` のCORSは `*.vercel.app` を総当たりで許可しているので、プレビューでもそのまま動きます。URLが確定した後にバックエンドを再デプロイする必要はありません。
- CORSを絞りたい場合は、同ファイルの `https://[a-z0-9-]+\.vercel\.app` を `https://<プロジェクト名>[a-z0-9-]*\.vercel\.app` に変えてください。現状は他人のVercelサイトからもプリフライトが通りますが、認証はCookieではなくAuthorizationヘッダのBearerトークンなので、トークンを持たない第三者に実害はありません。
- **独自ドメインを当てる場合は、そのドメインをCORSの正規表現に追加する必要があります**(`*.vercel.app` にマッチしなくなるため)。
- `backend/requirements.txt` はバージョンを固定してあります。ビルド時に最新版が入って、ローカルでは再現しない失敗を踏むのを防ぐためです。
