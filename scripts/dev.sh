#!/bin/sh
set -eu

: "${PORT:=3000}"
serverpid=

main() {
    trap cleanup INT TERM EXIT
    python3 -m http.server "${PORT}" --directory ./dist &
    serverpid=$!
    nodemon -V \
        -i build -i dist \
        -e js,json,sh,css \
        -x './scripts/build.sh --dev'
}

cleanup() {
    trap 'exit 1' INT TERM
    trap - EXIT
    if [ "${serverpid}" = "" ]; then return; fi
    kill "${serverpid}"
    exit 0
}

main "$@"
