#!/bin/bash
# Platform-safe 1080p export from the rendered 120fps chunks (out/final/part_*.mp4 + audio.aac).
# Remotion's raw output is yuvj420p (full range) + level 5.1 @120fps, which many players/platforms cap at 720p.
# Usage: tools/export-1080p.sh [fps=60] [crf=15]
set -e; cd "$(dirname "$0")/../out/final"; FPS=${1:-60}; CRF=${2:-15}
LV=4.2; [ "$FPS" -le 30 ] && LV=4.1
ffmpeg -v error -y -f concat -safe 0 -i list.txt -i audio.aac \
 -vf "fps=$FPS,scale=in_color_matrix=bt601:out_color_matrix=bt709:in_range=pc:out_range=tv:flags=lanczos+accurate_rnd,format=yuv420p" \
 -c:v libx264 -preset medium -crf $CRF -profile:v high -level $LV -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
 -maxrate 40M -bufsize 80M -g $((FPS*2)) -c:a aac -b:a 192k -shortest -movflags +faststart tutorial-1080p-${FPS}fps.mp4
