# indukto — webpage

## Photo gallery

The gallery on `photo.html` is generated from the `photos/` folder — no hand-editing needed.

To add or remove pictures:

1. Drop image files (`.avif`, `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`) into `photos/`
2. Run `node build-gallery.mjs`
3. Commit `photos.js` (and the new files) with the rest of your changes

Order follows the filenames (natural sort, so `2` < `10`). Prefix a file with a
number to pin its position, e.g. `01-sunset.avif`.

> `photos.js` is committed so the live site works out of the box — just remember
> to re-run the script whenever the folder changes.
