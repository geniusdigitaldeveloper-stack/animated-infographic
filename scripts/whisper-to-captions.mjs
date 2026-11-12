// Convert faster-whisper word-level JSON into src/scenes/captions.json
// Usage: node scripts/whisper-to-captions.mjs whisper.json
// Expected input: {segments:[{words:[{word,start,end}]}]}  (faster-whisper word_timestamps=True)
import {readFileSync, writeFileSync} from 'node:fs';
const [, , input] = process.argv;
if (!input) { console.error('usage: node scripts/whisper-to-captions.mjs whisper.json'); process.exit(1); }
const j = JSON.parse(readFileSync(input, 'utf8'));
const words = (j.segments ?? []).flatMap((s) => s.words ?? []).map((w) => ({text: w.word.trim(), start: w.start, end: w.end}));
writeFileSync('src/scenes/captions.json', JSON.stringify(words, null, 2));
console.log(`wrote ${words.length} words -> src/scenes/captions.json`);
