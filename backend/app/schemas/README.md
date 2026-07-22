# APIスキーマのルール

`schemas` は、フロントエンドとバックエンドの間で送受信するデータの形を定義する。
DBのテーブル構造をそのまま表現する場所ではない。

## 命名規則

- Pythonコードでは `snake_case` を使う。
- APIのJSONとフロントエンドの型では `camelCase` を使う。
- すべてのAPIスキーマは `ApiSchema` を継承する。

例えば、Python上の `nice_count` はAPIレスポンスでは `niceCount` になる。

```python
class NiceResponse(ApiSchema):
    nice_count: int
```

```json
{
  "niceCount": 3
}
```

PythonとTypeScriptで同じ命名規則を無理に使うのではなく、各言語の慣例を保ったまま、
API境界で `ApiSchema` が自動変換する。

## 型を追加するときのルール

- レスポンス用スキーマは、対応する `frontend/src/types` の型と項目名・型をそろえる。
- 作成用と更新用の入力スキーマは、レスポンス用とは分ける。
- 作成時にクライアントから受け取らないID、作成日時、集計値などは入力スキーマに含めない。
- DBとAPIで名前が違う項目は、サービス層で変換する。
- 数値範囲や文字数など、APIで保証する制約は `Field` で定義する。

ルーターでは `response_model` を指定し、返却するデータがスキーマと一致することを
FastAPIに検証させる。

```python
@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: UUID):
    ...
```
