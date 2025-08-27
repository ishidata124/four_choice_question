#!/bin/bash

ENV="$1"

# ENVが空なら終了
if [ -z "$ENV" ]; then
  echo "環境変数が指定されていません。"
  exit 0
fi

echo ${ENV}

# TODO AWS環境がないためSTOP
