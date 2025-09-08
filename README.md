# 4択問題（簡易版）
## このアプリについて
4択問題のアプリケーションです。
AWSのS3に配置して使用する想定で作成しています。

## 構成
- HTML
- CSS
- JavaScript

## 使用方法
- ローカルだとXAMMPのvhostでも使用可能。
  - 普通にファイルで起動させようとするとJSONファイル読み込みでCORSエラーが出ます。
- S3上だとバケット内の適切な階層に配置で実行可能。  
- four_choice_question.jsonは見本でfour_choice_question_q.jsonに問題、four_choice_question_a.jsonに答えを分けて使用する。

## 仕様
- テストにも使えるようになっています。  
- 17点以上で合格になるように書いてあるので自由に書き換えて使ってください。  
- 問題は最低20問入れてください。  
- 21問以上入れても動作するように作ってあります。  
- 問題はランダムに出題されるようにしてあります。  
- 処理内でクッキーを使用しています。有効にして使用してください。

## デプロイ方法
``` shell
TODO: 作成中
sh src/sh/sam.sh dev

# フォーマット
sh src/sh/sam.sh [dev/stg/prd]

```

## localでの確認方法
``` bash
python -m http.server 8000

# ブラウザURL例:
http://localhost:8000/public/
```
