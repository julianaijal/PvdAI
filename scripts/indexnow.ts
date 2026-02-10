/**
 * Submit URLs to IndexNow-supporting search engines.
 * Usage: npx tsx scripts/indexnow.ts [url1 url2 ...]
 * If no URLs are given, submits the site root.
 */

const KEY = "b5f6e2442369211c559e2d4b0b87fbed";
const HOST = "pvdai.tech";
const SEARCH_ENGINES = ["api.indexnow.org", "www.bing.com", "yandex.com"];

const urls =
  process.argv.length > 2
    ? process.argv.slice(2)
    : [`https://${HOST}`];

async function submit(engine: string) {
  const body = {
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls,
  };

  const res = await fetch(`https://${engine}/indexnow`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  console.log(`${engine}: ${res.status} ${res.statusText}`);
}

console.log(`Submitting ${urls.length} URL(s) to IndexNow...`);
Promise.all(SEARCH_ENGINES.map(submit)).then(() => console.log("Done."));
