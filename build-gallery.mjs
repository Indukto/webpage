#!/usr/bin/env node
// build-gallery.mjs
//
// Scans the photos/ folder for image files and writes photos.js, a tiny
// manifest that photo.html loads to render the gallery. Add or remove
// pictures in photos/, then run:  node build-gallery.mjs
//
// Order follows the filenames (natural sort, so "2" < "10"). Prefix a file
// with a number to pin its position, e.g. "01-sunset.avif".

import { readdir, writeFile } from "node:fs/promises";

const PHOTO_DIR = "photos";
const OUT_FILE = "photos.js";
const EXTENSIONS = new Set([".avif", ".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const extension = (file) => file.slice(file.lastIndexOf(".")).toLowerCase();

const files = (await readdir(PHOTO_DIR))
  .filter((file) => EXTENSIONS.has(extension(file)))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

await writeFile(OUT_FILE, "window.PHOTOS = " + JSON.stringify(files, null, 2) + ";\n");
console.log(`wrote ${OUT_FILE} with ${files.length} photo(s) from ${PHOTO_DIR}/`);
