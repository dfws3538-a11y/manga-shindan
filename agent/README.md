# アオに聞け — なんでも答えるAIエージェント

青いスーツのちびキャラ「アオ」が、どんな質問にもClaudeで答えてくれるチャットアプリです。
スマホのホーム画面に追加すると、アプリのように全画面で使えます（PWA）。

## できること

- 会話形式でなんでも質問（回答はリアルタイムに表示）
- 最新情報が必要な質問は自動でウェブ検索し、参考ページを表示
- 会話はその端末に保存され、＋ボタンで新しい会話
- 送信中は■ボタンで停止

モデルは `claude-opus-5-5`。断られた質問は `fallbacks: "default"` で別モデルが自動で引き継ぎます。

## 使い方

### 自分だけで使う（いちばん簡単）

1. [Claude Console](https://console.anthropic.com/) でAPIキーを発行
2. `https://<ユーザー名>.github.io/manga-shindan/agent/` を開く
3. 右上の歯車 →「Claude APIキー」に貼り付けて保存

キーはその端末のブラウザ（localStorage）にだけ保存されます。
**キーを入れた端末を他人に貸さないでください。**

### みんなに公開する（キーを隠す）

ブラウザにキーを置かずに済むよう、`proxy/` の Cloudflare Worker で中継します。

```bash
cd agent/proxy
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY   # キーを貼り付け
npx wrangler deploy                         # 表示されたURLを控える
```

- `wrangler.toml` の `ALLOWED_ORIGINS` を公開先のURLにしておく（それ以外のサイトからは使えません）
- アプリの歯車 →「プロキシURL」に、控えたWorkerのURLを入れて保存
- 公開するとアクセスした人の分だけ料金がかかります。Console で利用上限（Spend limit）を設定しておくと安心です

## キャラクターの変更

`index.html` 冒頭の `CHARACTER` を書き換えます。

- `name` / `title` … ヘッダーに出る名前と肩書き
- `system` … 性格・口調・答え方の指示
- `suggestions` … 最初の画面に出る質問例

画像は `character.jpg`（トップ画面）、`avatar.jpg`（吹き出し横の顔）、`icons/`（ホーム画面アイコン）です。
