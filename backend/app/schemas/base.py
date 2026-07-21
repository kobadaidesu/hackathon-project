from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class ApiSchema(BaseModel):
    """APIスキーマ共通の基底クラス。

    PythonではPEP 8に沿ったsnake_case、フロントエンドとAPIのJSONでは
    TypeScriptで一般的なcamelCaseを使う。このクラスを継承することで、
    言語ごとの命名規則を保ちながらAPIのプロパティ名を統一する。
    """

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
