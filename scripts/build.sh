#!/bin/sh
set -eu

main() {
    while [ $# -gt 0 ]; do
        arg="$1"
        shift
        case "${arg}" in
            --dev) export NODE_ENV=development ;;
            --prod) export NODE_ENV=production ;;
            *)
                printf >&2 'unknown arg: %s\n' "${arg}"
                return 1
                ;;
        esac
    done
    set -x
    rm -rf dist build
    mkdir dist build
    node ./scripts/compile.js
    node ./build/server.js >dist/index.html
    cp ./build/client.js dist/client.js
}

main "$@"
