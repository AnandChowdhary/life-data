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

const wait = ms => new Promise((resolve) => {
  setTimeout(() => resolve(), ms);
});

(async () => {
  await mkdirp(join(__dirname, "highlights"));
  const highlights = await readJson(join(__dirname, "instagram-highlights.json"));
  for await (const highlightKey of Object.keys(highlights)) {
    const highlight = highlights[highlightKey];
    const slug = trim(highlight.meta.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""), "-");
    const directory = join(__dirname, "highlights", slug);
    await mkdirp(directory);
    console.log(`Downloading files for ${slug}`);
    const file = await download(highlight.meta.cover);
    await writeFile(join(directory, "cover.jpg"), file);
    highlight.data.forEach(image => {
      download(image.images[0].url)
        .then(img => writeFile(join(directory, `${image.id}.jpg`), img));
    });
    await wait(1000);
  }
})();
