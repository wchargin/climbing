#!/bin/sh
set -eu

: "${BUCKET:=wchargin-climbing-public}"

main() {
    if [ $# -ne 2 ] || [ -z "$1" ] || [ -z "$2" ]; then
        printf >&2 'usage: upload-img <filename> <image-id>\n'
        return 1
    fi
    tmpdir="$(mktemp -d)"
    trap 'rm -f "${tmpdir}"/*/*.jpg && rmdir "${tmpdir}"/* && rmdir "${tmpdir}"' EXIT
    mkdir "${tmpdir}"/full "${tmpdir}"/1200 "${tmpdir}"/400
    filename="$1"
    image_id="$2"
    convert "${filename}" \
        -strip -write "${tmpdir}/full/${image_id}.jpg" \
        -resize 1200x1200 -write "${tmpdir}/1200/${image_id}.jpg" \
        -resize 400x400 -write "${tmpdir}/400/${image_id}.jpg" \
        null:
    gsutil -m \
        -h 'cache-control: public, max-age=60' \
        -h 'content-type: image/jpeg' \
        cp -r "${tmpdir}"/* "gs://${BUCKET}"
}

main "$@"
