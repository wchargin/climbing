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
    : "${NODE_ENV:=production}"
    prod=
    if [ "${NODE_ENV:-}" = production ]; then
        prod=1
    fi

    set -x
    rm -rf dist build
    mkdir dist build
    node ./scripts/compile.js
    node ./build/server.js >dist/index.html
    node ./node_modules/.bin/tailwindcss ${prod:+--minify} -i src/main.css -o dist/styles.css
    cp ./build/client.js dist/client.js
    # cp -r ./static/* dist/  # no statics right now
}

main "$@"
