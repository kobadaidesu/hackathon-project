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
