#!/bin/sh
# Regenerate the icon PNGs: small sizes from their pixel-snapped SVGs, 128 from icon.svg.
set -e
cd "$(dirname "$0")/.."
node tools/icons.mjs
cd extension/icons
for n in 16 20 24 32 48; do ffmpeg -loglevel error -y -i "icon-$n.svg" -pix_fmt rgba "icon-$n.png"; done
ffmpeg -loglevel error -y -width 128 -height 128 -i icon.svg -pix_fmt rgba icon-128.png
