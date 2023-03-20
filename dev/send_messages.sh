#!/usr/bin/env bash

SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
EMOJI_FILE="$SCRIPT_DIR/emojis.txt"

while true; do
    emoji1=$(cat "$EMOJI_FILE" | shuf | head -n 1)
    emoji2=$(cat "$EMOJI_FILE" | shuf | head -n 1)
    emoji3=$(cat "$EMOJI_FILE" | shuf | head -n 1)
    msg="From command line at $(date +'%M:%S') $emoji1 $emoji2 $emoji3"
    echo "===== $msg ====="
    (time sui client call --package 0x9069d4d7717f8053a76f8a3d4a01732afacd0ea8 \
        --module event_chat --function send_message \
        --args 0x8e8be5d3823d6a04ddb8dc0963b5c7e335aee26d "$msg" \
        --gas-budget 1000) 2>&1 | grep real
    sleep 10
done;
