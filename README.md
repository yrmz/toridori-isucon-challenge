<br />
<div align="center">
  <h3 align="center">2024-12 合宿 workshop 用リポジトリ</h3>
  <p align="center">
    合宿で利用する社内 ISUCON 用の課題アプリケーションです。このコードは [catatsuy/private-isu](https://github.com/catatsuy/private-isu) を元に作成されています。
  </p>
</div>

### はじめに

このリポジトリは ISUCON の練習用リポジトリとして有名な [catatsuy/private-isu](https://github.com/catatsuy/private-isu) を、トリドリでの研修ように、トリドリで主に利用している NodeJS(NestJS + Prisma) の構成に書き換えたものです。

[ISUCON](https://isucon.net/) は、Webアプリケーションの性能改善をテーマにしたコンテストです。参加者は提供された環境やアプリケーションに対して、スピードや効率を向上させるための最適化を行い、その成果を競います。具体的には、クエリの効率化、キャッシュの活用、サーバー設定の最適化などが主な課題です。

この課題では、サーバー設定については対象外とし、DBを含むアプリケーションのチューニングを行ってもらいます。

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### プロジェクト構成

プロジェクト構成は以下のようになっています。

```txt
.
├── README.md
├── benchmarker   # ベンチマーカーのソースコード
├── data          # テストデータなど
├── dist          
├── prisma        # prisma のスキーマファイルなど
├── public        # frontend リソース
├── src           # nestjs コード
└── views         # ejs テンプレート
```

主に `./src` 以下のコードをチューニングする想定です。

今回の nestjs アプリケーションは api サーバーではなく、 html を返却する、 Web Application として動作します。
返却する html 自体は変更すると、ベンチマーカーが正しく動作しなくなる可能性があるため注意してください。

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## はじめる

ローカル開発環境の構築手順を記載します。

### 前提

このプロジェクトでは `nodejs` などのバージョンを管理するために [asdf](https://asdf-vm.com/) を利用します。
あらかじめ環境に `asdf` をインストールしてください。

以下にインストール手順を記載しますが、最新バージョンなどは公式ドキュメントを参照してください。

```bash
brew install coreutils curl git
git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.13.1
```

インストール後、使用している `shell` およびインストール方法に合わせて環境変数等の設定をしてください。
詳細は `asdf` の [ドキュメント](https://asdf-vm.com/ja-jp/guide/getting-started.html) を参照してください。

`asdf` の設定が完了したら、以下のコマンドで必要な環境等をインストールしてください。

```bash
# 必要なプラグインを追加します
asdf plugin add nodejs
asdf plugin add pnpm

# .tool-versions に記載されているものをインストールします
asdf install
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### セットアップ

1. 以下のコマンドで、アプリケーションの動作テストなどに必要なテストデータなどをダウンロードします。（このファイルは2GB程度あるので注意してください）

   ```bash
   make init
   ```

2. 依存ライブラリをインストールします。

   ```bash
   pnpm install
   ```

3. 次に、ローカルの DB インスタンスを起動します。

   ```bash
   make up
   ```

4. ローカルDBにマイグレーションを適用します。

   ```bash
   pnpm run migrate:deploy
   ```

5. ローカルDBにテストデータを挿入します。（この操作は数分から数十分かかります。時間はPCのスペックに依存します）

   ```bash
   make load-initial-data
   ```

6. PrismaClient をビルドします。

   ```bash
   pnpm run prisma:generate
   ```

上記で事前セットアップは完了です。

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### 起動

以下のコマンドで、開発アプリケーションを起動します。

```bash
pnpm run dev
```

上記により、 [http://localhost:9000/](http://localhost:9000/) にアクセスし、動作確認等を行うことができます。

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### ビルド

ビルドの前に、事前に `format` と `lint` に問題が無いか確認します。
以下が１つでも失敗した場合、競技上失格扱いとし、スコアは強制的に 0 となるため注意してください。

> format および lint には biome を利用していますが、 biome で検証できないルールのために ESLint も追加で設定しています。
> ESLint など、厳しめに設定しているので注意してください。

```bash
pnpm run format
pnpm run lint
pnpm run lint:eslint
```

以下のコマンドにより、アプリケーションをビルドします。

```bash
pnpm install --frozen-lockfile
pnpm run prisma:generate
pnpm run build
```

ビルドしたコードは以下コマンドで起動できます。

```bash
NODE_ENV=production node dist/main.js
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### DBへ変更を加えるには

今回、DBのテーブルスキーマの変更は許可されません。
しかし、Index の追加/削除は可能です。

Index の追加は prisma migration を経由して適用するため、 `./prisma/schema.prisma` を修正してください。
`@@index` を利用して index を追加できます。詳細は prisma の[ドキュメント](https://www.prisma.io/docs/orm/prisma-schema/data-model/indexes) を確認してください。

`./prisma/schema.prisma` を変更した場合、必ず以下の作業を行なって、 `PrismaClient` を更新してください。

```bash
# schema.prisma の変更から migration 用 sql を作成し、またDBへ変更を適用する。
pnpm run migrate:dev

# PrismaClient ライブラリを更新する
pnpm run prisma:generate
```

> PrismaClient を修正した場合 `TS Server` や `ESLint Server` を必要に応じて再起動してください。

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### ベンチーマーク

ベンチマーカーのローカルでの起動は、以下のように Docker を利用することを推奨します。

```bash
cd benchmarker
docker build -t private-isu-benchmarker .
docker run --network host -i private-isu-benchmarker /bin/benchmarker -t http://host.docker.internal:9000 -u /opt/userdata

# Linuxの場合
docker run --network host --add-host host.docker.internal:host-gateway -i private-isu-benchmarker /bin/benchmarker -t http://host.docker.internal:9000 -u /opt/userdata
```

`benchmarker` の実行結果として、以下のようなスコア情報が表示されます。

```bash
{"pass":true,"score":323,"success":306,"fail":0,"messages":[]}
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>
