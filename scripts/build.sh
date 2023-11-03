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
    node ./scripts/checkData.js || false
    rm -rf build dist.new
    mkdir build dist.new
    node ./scripts/compile.js
    node ./build/server.js dist.new/
    node ./node_modules/.bin/tailwindcss ${prod:+--minify} -i src/main.css -o dist.new/styles.css
    cp ./build/client.js dist.new/client.js
    cp ./build/loader.js dist.new/store-loader.js
    # cp -r ./static/* dist.new/  # no statics right now

    if [ -e dist ]; then
        mv dist dist.old
        mv dist.new dist
        rm -rf dist.old
    else
        mv dist.new dist
    fi
}

main "$@"
