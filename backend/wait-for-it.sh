#!/usr/bin/env bash
#   Use this script to test if a given TCP host/port are available

# The MIT License (MIT)
# https://github.com/vishnubob/wait-for-it

set -e

TIMEOUT=15
QUIET=0
HOST=""
PORT=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        -q|--quiet)
        QUIET=1
        shift
        ;;
        -t|--timeout)
        TIMEOUT="$2"
        shift 2
        ;;
        --)
        shift
        break
        ;;
        *)
        if [[ -z "$HOST" ]]; then
            HOST="$1"
        elif [[ -z "$PORT" ]]; then
            PORT="$1"
        fi
        shift
        ;;
    esac
    done

if [[ -z "$HOST" || -z "$PORT" ]]; then
    echo "Usage: $0 host:port [-- command args]"
    exit 1
fi

if [[ "$HOST" == *":"* ]]; then
    PORT="${HOST##*:}"
    HOST="${HOST%%:*}"
fi

for i in $(seq $TIMEOUT); do
    nc -z "$HOST" "$PORT" >/dev/null 2>&1 && break
    if [[ $i -eq $TIMEOUT ]]; then
        if [[ $QUIET -ne 1 ]]; then
            echo "Timeout after $TIMEOUT seconds waiting for $HOST:$PORT"
        fi
        exit 1
    fi
    sleep 1
    done

if [[ $QUIET -ne 1 ]]; then
    echo "$HOST:$PORT is available after $i seconds"
fi

exec "$@"
