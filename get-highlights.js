const { mkdirp, writeFile, readJson } = require("fs-extra");
const { join } = require("path");
const download = require("download");

const trim = (s, mask) => {
  while (~mask.indexOf(s[0]))
    s = s.slice(1);
  while (~mask.indexOf(s[s.length - 1]))
    s = s.slice(0, -1);
  return s;
}

(async () => {
  await mkdirp(join(__dirname, "highlights"));
  const highlights = await readJson(join(__dirname, "instagram-highlights.json"));
  for await (const highlightKey of Object.keys(highlights)) {
    const highlight = highlights[highlightKey];
    const slug = trim(highlight.meta.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""), "-");
    const directory = join(__dirname, "highlights", slug);
    await mkdirp(directory);
    console.log("Downloading", highlight.meta.cover);
    const file = await download(highlight.meta.cover);
    await writeFile(join(directory, "cover.jpg"), file);
    for await (const image of highlight.data) {
      console.log("Downloading", image.images[0].url);
      const img = await download(image.images[0].url);
      await writeFile(join(directory, `${image.id}.jpg`), img);
    }
  }
})();
