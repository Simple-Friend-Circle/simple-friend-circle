import * as core from "@actions/core";
import { readFile, writeFile, mkdir } from "fs/promises";
import Parser from "rss-parser";

interface Article {
  name: string;
  title: string;
  avatar: string;
  link: string;
  website: string;
  date: number;
}

const LINKS_PATH = "./links";
const TEMPLATE = await readFile("./template.html", "utf-8");

const articles: Article[] = [];

const max_everyone = Number(core.getInput("max_everyone"));
const max_number = Number(core.getInput("max_number"));

async function readLinks(): Promise<string[][]> {
  const content = await readFile(LINKS_PATH, { encoding: "utf8" });
  return content.split("\n").map((s) => s.split(" "));
}

async function fetchRSS([link, avatar]: string[]): Promise<any> {
  const parser = new Parser();
  const feed = await parser.parseURL(link);
  feed.avatar = avatar;
  return feed;
}

function articleExtracter(item: any, feed: any) {
  const date = Date.parse(item.isoDate);
  const too_old_date = Number(new Date(2015, 0, 1));
  if (item.content.trim() != "" && date > too_old_date) {
    const article = {
      name: item.title,
      title: feed.title,
      avatar: feed.avatar,
      link: item.link,
      website: feed.link,
      date: date,
    };
    articles.push(article);
  }
}

async function fetchArticles(links: any) {
  const rss = links.filter((i: string[]) => Boolean(i[0])).map(fetchRSS);
  for (let i of rss) {
    const feed = await i;
    for (let item of feed.items.slice(0, max_everyone)) {
      articleExtracter(item, feed);
    }
  }

  articles.sort((a, b) => b.date - a.date);
}

async function generate_page() {
  let list = "";
  for (let { name, title, avatar, link, website, date } of articles.slice(
    0,
    max_number,
  )) {
    list += `
<div class="item">
<img src="${avatar}" alt="avatar" class="avatar">
<div class="info">
<a href="${website}" target="_blank" class="title">${title}</a>
<a href="${link}" target="_blank" class="name">${name}</a>
<time class="date">${new Date(date).toLocaleDateString()}</time>
</div>
</div>
`;
  }

  const html = TEMPLATE.replace("<LIST>", list);
  await mkdir("public", { recursive: true });
  await writeFile("public/index.html", html, { flag: "w+" });
}

async function main() {
  const links = await readLinks();
  await fetchArticles(links);
  await generate_page();
}

try {
  main();
} catch (err) {
  core.setFailed(`${err}`);
}
