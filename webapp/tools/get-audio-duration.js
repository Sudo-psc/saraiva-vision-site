#!/usr/bin/env node
import { parseFile } from 'music-metadata';
import path from 'node:path';

async function formatDuration(secondsFloat) {
  const seconds = Math.round(secondsFloat || 0);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

async function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error('Usage: get-audio-duration.js <file1.mp3> [file2.mp3 ...]');
    process.exit(1);
  }

  for (const f of files) {
    try {
      const { format } = await parseFile(f);
      const dur = await formatDuration(format.duration);
      console.log(`${path.basename(f)}\t${dur}`);
    } catch (err) {
      console.error(`Error reading ${f}: ${err.message}`);
      process.exitCode = 1;
    }
  }
}

main();

