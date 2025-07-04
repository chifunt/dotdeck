# Dotdeck

_A place to share, browse, and manage developer "decks" - small, copy-pastable configuration snippets (dotfiles, CLI tweaks, etc.)._

[Live Front-End](https://cc241001-10736.node.fhstp.cc) ·
[Live Back-End](https://cc241001-10735.node.fhstp.cc) ·

---

## Why Dotdeck?

Finding a single working snippet in a giant dot-files repository (or a six-year-old forum post/reddit thread/github discussion) is painful.
Dotdeck lets developers:

- publish a focused “deck” (title, tags, thumbnail, code, description);
- browse & search decks by tag, tool, or keyword;
- like/dislike, comment, and discuss in one place.

---

## Features

- **Full-text search** and pagination for fast discovery
- **Authentication & JWT** (register / login)
- **Role-based access control** (admin, moderator, user)
- **Like / dislike & comments** with live counters
- **Image uploads** (WebP, compressed via Sharp)
- **Admin panel** for tags, users, decks, audit logs
- **Dark / light theme** (Rose Pine palette)
- Fully documented **OpenAPI 3.0** spec via Swagger

---

## Tech Stack

| Layer     | Tech                                                                         |
| --------- | ---------------------------------------------------------------------------- |
| Front-end | **Next.js 14**, React 18, TypeScript, TailwindCSS, Shadcn/UI, TanStack Query |
| Back-end  | **Express 4**, MySQL, multer + sharp, JSON Web Tokens                        |
| Dev & Ops | Campus:Cloud Node instances                                                  |
