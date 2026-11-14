#!/bin/bash
# FINAL render of the Tutorial composition: 1920x1080 @ 120fps, source = 1440p enhanced master (public/tutorial/master.mp4).
# Video in chunks (safe to resume), audio separately, then muxed. Usage: tools/render-final.sh [crf=18] [chunk=3000]
set -e
cd "$(dirname "$0")/.."
CRF=${1:-18}; CH=${2:-3000}
export REMOTION_TUT_FPS=120 REMOTION_TUT_SRC=tutorial/master.mp4
OUT=out/final; mkdir -p $OUT
TOTAL=$(node -e "const p=require('./src/tutorial/plan.json');console.log(Math.ceil((p.duration+6.5)*120))")
echo "total frames $TOTAL"
BR="--browser-executable=/opt/pw-browsers/chromium --concurrency=4 --trace off"
i=0; : > $OUT/list.txt
for ((a=0; a<TOTAL; a+=CH)); do
  b=$((a+CH-1)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  f=$OUT/part_$(printf %02d $i).mp4
  if [ ! -s $f ]; then npx remotion render Tutorial $f --frames=$a-$b --codec=h264 --crf=$CRF --jpeg-quality=100 --muted $BR; fi
  echo "file '$PWD/$f'" >> $OUT/list.txt; i=$((i+1))
  echo "CHUNK_DONE $i ($a-$b)"
done
[ -s $OUT/audio.aac ] || npx remotion render Tutorial $OUT/audio.aac --codec=aac $BR
ffmpeg -v error -y -f concat -safe 0 -i $OUT/list.txt -i $OUT/audio.aac -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart $OUT/tutorial-final-1920x1080-120fps.mp4
echo "ALL_DONE"
