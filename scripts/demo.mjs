import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const definitions = [
  { title: "Git Aliases for Focused Reviews", slug: "git-review-aliases", tags: ["git", "review"], language: "ini",
    description: "Check the files changed in a branch, then read the patch without leaving the terminal.",
    caption: "Add these aliases to your Git configuration.", code: "[alias]\n    changed = diff --stat\n    review = diff --word-diff\n    recent = log --oneline -10" },
  { title: "Relative Line Numbers in Neovim", slug: "neovim-line-numbers", tags: ["neovim", "lua"], language: "lua",
    description: "Keep the current line number visible and use relative numbers to count motion commands.",
    caption: "Place these options in init.lua.", code: "vim.opt.number = true\nvim.opt.relativenumber = true\nvim.opt.signcolumn = 'yes'" },
  { title: "A Quieter Git Status", slug: "git-short-status", tags: ["git", "shell"], language: "sh",
    description: "Show the current branch and changed files in a short listing before making a commit.",
    caption: "Run this inside a Git repository.", code: "git status --short --branch\ngit diff --check" },
  { title: "Keep More Shell History", slug: "zsh-history", tags: ["shell", "zsh"], language: "sh",
    description: "Store recent commands between sessions and avoid saving the same command twice in a row.",
    caption: "Add these settings to .zshrc.", code: "HISTFILE=~/.zsh_history\nHISTSIZE=10000\nSAVEHIST=10000\nsetopt HIST_IGNORE_DUPS\nsetopt APPEND_HISTORY" },
];

const tags = [...new Set(definitions.flatMap((deck) => deck.tags))].map((name, index) => ({ id: index + 1, name, isOfficial: true }));
const decks = definitions.map((deck, index) => ({
  id: index + 1, title: deck.title, slug: deck.slug, description: deck.description,
  thumbnailUrl: null, createdAt: "2025-06-01T12:00:00Z", author: { id: 1, username: "demo" },
  likes: 0, dislikes: 0, tags: tags.filter((tag) => deck.tags.includes(tag.name)),
  snippets: [{ id: index + 1, language: deck.language, caption: deck.caption, code: deck.code, sortOrder: 0 }],
}));

const server = createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:4301");
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
  const send = (value, status = 200) => { res.writeHead(status); res.end(JSON.stringify(value)); };
  if (req.method !== "GET") return send({ message: "This local demo uses read-only sample data." }, 403);
  const url = new URL(req.url, "http://localhost:4300");
  const route = url.pathname.replace(/^\/api\/v1/, "");
  if (route === "/tags") return send(tags);
  if (route === "/decks") {
    const q = (url.searchParams.get("q") || "").toLowerCase();
    const tag = url.searchParams.get("tag");
    const filtered = decks.filter((deck) => `${deck.title} ${deck.description}`.toLowerCase().includes(q) && (!tag || deck.tags.some((item) => item.name === tag)));
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 16));
    const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0);
    return send({ data: filtered.slice(offset, offset + limit), paging: { limit, offset, total: filtered.length } });
  }
  if (/^\/decks\/\d+\/comments$/.test(route)) return send({ data: [], paging: { total: 0, limit: 50, offset: 0 } });
  if (/^\/decks\/\d+\/ratings$/.test(route)) return send({ upvotes: 0, downvotes: 0, myVote: 0 });
  const slug = route.match(/^\/decks\/slug\/(.+)$/)?.[1];
  const deck = slug ? decks.find((item) => item.slug === slug) : decks.find((item) => route === `/decks/${item.id}`);
  if (deck) return send(deck);
  if (route === "/users/demo") return send({ id: 1, username: "demo", decks });
  return send({ message: "This route is not included in the local preview." }, 404);
});

server.listen(4300, "127.0.0.1", () => console.log("Sample API: http://localhost:4300/api/v1"));
const frontend = spawn(process.execPath, [path.join(root, "frontend/node_modules/next/dist/bin/next"), "dev", "--port", "4301", "--hostname", "127.0.0.1"], {
  cwd: path.join(root, "frontend"), stdio: "inherit",
  env: { ...process.env, NEXT_PUBLIC_API_BASE_URL: "http://localhost:4300/api/v1", NEXT_PUBLIC_BACKEND_URL: "http://localhost:4300", NEXT_PUBLIC_DEMO_MODE: "1" },
});
function stop() { frontend.kill("SIGTERM"); server.close(); }
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
frontend.on("exit", (code) => { server.close(); process.exitCode = code ?? 0; });
server.on("error", (error) => { console.error(error.message); stop(); process.exitCode = 1; });
