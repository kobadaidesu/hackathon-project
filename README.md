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

1. USBテザリング(iPhone)でPCとスマホを繋ぐ
2. `ipconfig` でPCに付いたIPアドレスを確認する(テザリング中は `172.20.10.x` になります)
3. `frontend/.env` の `VITE_API_BASE_URL` をそのIPに書き換える

   ```text
   VITE_API_BASE_URL=http://172.20.10.3:8000
   ```

4. Viteを再起動する。`.env` は起動時にしか読まれないので、書き換えただけでは反映されません
5. Viteを外部からも開けるように `--host` を付けて起動する

   ```bash
   npm run dev -- --host
   ```

6. スマホのブラウザで `http://<PCのIP>:5173` を開く
7. 確認が終わったら `frontend/.env` を `http://localhost:8000` に戻す

`VITE_API_BASE_URL` はブラウザ(=スマホ)から見た宛先です。スマホにとって `localhost` はスマホ自身を指してしまうため、ここだけはIPにする必要があります。バックエンド側は `--host 0.0.0.0` で起動していれば何も変更は要りません。

`frontend/.env` はgitignore済みなので、書き換えてもPushされません。ただし戻し忘れると次にPC単体で動かしたときに繋がらなくなるので、抜いたら戻す習慣にしてください。
