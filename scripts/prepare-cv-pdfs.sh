#!/bin/sh
set -eu

ARCHIVE_DIR=".cv-upload/archive"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT INT TERM

cat "$ARCHIVE_DIR"/*.part | base64 --decode > "$TMP_DIR/cvs.tar.xz"
tar -xJf "$TMP_DIR/cvs.tar.xz" -C "$TMP_DIR"

cp "$TMP_DIR/cv-es(1).pdf" public/cv-es.pdf
cp "$TMP_DIR/cv-en(1).pdf" public/cv-en.pdf
cp "$TMP_DIR/cv-de(1).pdf" public/cv-de.pdf
cp "$TMP_DIR/cv-fr(1).pdf" public/cv-fr.pdf
cp "$TMP_DIR/cv-it(1).pdf" public/cv-it.pdf
cp "$TMP_DIR/cv-rm(1).pdf" public/cv-rm.pdf

echo 'c1709be62f5cd3f48d9ffab7aa6738ca10b6590010000dd801a9c58559fe6a49  public/cv-es.pdf' | sha256sum -c -
echo 'af8919acae4eb521ce7459d9b3f1e55d34dc73f5e25ac794f98365caed1a93e2  public/cv-en.pdf' | sha256sum -c -
echo '19b3a4db7e24876b63fcb0bdde8156eea305a45f02e45da3ecdb7eddc7f988e0  public/cv-de.pdf' | sha256sum -c -
echo '6a8f042e9848b9668981b5cceddcd6e3ea951f36cdbcce3fd13d4dc7c1a4de86  public/cv-fr.pdf' | sha256sum -c -
echo 'a0ca02444dc02ef290bb1e9df786b9dbab59d7ee597c4ea95cc734d244e5d614  public/cv-it.pdf' | sha256sum -c -
echo 'f8a1d00e14b5b409eb7d4672f117900c0609fee635cc88931c13665b354174ce  public/cv-rm.pdf' | sha256sum -c -
