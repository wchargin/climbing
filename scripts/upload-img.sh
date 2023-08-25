#!/bin/sh
set -eu

: "${BUCKET:=wchargin-climbing-public}"

main() {
    if [ $# -ne 2 ]; then
        printf >&2 'usage: upload-img <filename> <image-id>\n'
        return 1
    fi
    filename="$1"
    image_id="$2"
    cat "${filename}" | upload "full/${image_id}.jpg"
    for size in 1200 400; do
        convert "${filename}" -resize "${size}x${size}" jpg:- \
            | upload "${size}/${image_id}.jpg"
    done
}

upload() {
    gsutil -h 'content-type: image/jpeg' cp - "gs://${BUCKET}/$1"
}

main "$@"
