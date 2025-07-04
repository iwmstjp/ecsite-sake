# ECサイト - 日本酒販売サイト

これは Node.js（Express）と PostgreSQL を使って開発した、架空の日本酒販売ECサイトです。
決済には Stripe API を導入し、商品閲覧・カート機能・購入処理を一通り体験できる構成になっています。

---

## 📦 主な機能

- ユーザー登録・ログイン機能（パスワードはハッシュ化）
- 商品一覧・詳細ページの表示
- 商品のカート追加・削除
- 購入履歴の確認（ユーザーごとに注文履歴を表示）
- Stripe API を用いたカード決済（テスト用）
- 管理画面からの商品管理


---

## 🛠️ 使用技術スタック

| 技術      | 内容                     　　　|
|-----------|--------------------------|
| Backend   | Node.js, Express         |
| DB        | PostgreSQL               |
| API    | Stripe, Sake-no-wa               |

---

## 🚀 セットアップ手順（ローカル環境）

```bash
git clone https://github.com/iwmstjp/ecsite-sake.git
cd ecsite-sake
npm install
cp .env.example .env
npm run dev