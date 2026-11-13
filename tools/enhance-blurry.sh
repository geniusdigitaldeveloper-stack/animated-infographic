#!/bin/bash
# Sharpen + de-block ONLY the blurry (recorder-zoomed) time ranges of a screen recording, output 1080p 30fps.
# Edit BL (seconds ranges) after measuring Laplacian sharpness per second. Honest: sharpening/cleanup, not true 4K detail.
# Usage: tools/enhance-blurry.sh original.mp4 out.mp4 [width]
# $1 in  $2 out  $3 width
IN=$1; OUT=$2; W=${3:-1920}
BL="between(t,32,34)+between(t,47,50)+between(t,118,140)+between(t,147,151)+between(t,154,159)+between(t,160,162)+between(t,177,183)+between(t,189,190)+between(t,193,197)"
ffmpeg -v error -y -i $IN -vf "deblock=filter=weak:block=8:alpha=0.12:beta=0.06:gamma=0.06:delta=0.06:enable='$BL',hqdn3d=1.6:1.6:5:5:enable='$BL',unsharp=5:5:0.9:5:5:0.0:enable='$BL',cas=0.55:enable='$BL',scale=$W:-2:flags=lanczos,fps=30" -c:v libx264 -preset veryfast -crf 22 -g 15 -c:a aac -b:a 160k $OUT
