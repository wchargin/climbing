#!/bin/sh
set -eu

main() {
    ensure_clean_working_tree
    # Don't want dev server running because it listens for filesystem events
    # and will get confused.
    ensure_no_dev_server

    builddir="./dist"
    tip="$(git rev-parse --short=12 --verify HEAD)"
    printf >&2 'deploy: building from %s\n' "${tip}"

    ./scripts/build.sh --prod
    git -C "${builddir}" init
    git -C "${builddir}" add .
    git -C "${builddir}" commit -m "[internal] build: clean deploy from ${tip}"
    git checkout gh-pages
    git fetch "${builddir}"
    commit="$(git commit-tree FETCH_HEAD^{tree} -p HEAD -m "build: deploy from ${tip}")"
    git reset --hard "${commit}"
    printf >&2 'Deploy commit created. To proceed, next steps:\n'
    printf >&2 '  * %s\n' '"python3 -m http.server" and poke around'
    printf >&2 '  * %s\n' '"git push origin gh-pages"'
    printf >&2 '  * %s\n' '"git checkout main"'
    printf >&2 'OR, to roll back:\n'
    printf >&2 '  * %s\n' '"git reset --hard gh-pages"'
    printf >&2 '  * %s\n' '"git checkout main"'
}

ensure_no_dev_server() {
    if lsof -i tcp:3000; then
        printf >&2 'deploy: fatal: port 3000 open; dev server running?\n'
        exit 1
    fi
}

ensure_clean_working_tree() {
    if ! git diff-files --quiet --ignore-submodules; then
        printf >&2 'deploy: fatal: unstaged changes in working tree\n'
        exit 1
    fi
    if ! git diff-index --cached --quiet --ignore-submodules HEAD --; then
        printf >&2 'deploy: fatal: uncommitted changes in index\n'
        exit 1
    fi
}

main "$@"
