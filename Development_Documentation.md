# Development Documentation

## Hosting Setup

The Dotdeck App has been hosted on Campus:Cloud of St. Pölten UAS (fhstp.cc) on 2 separate node instances.

[Backend](https://cc241001-10735.node.fhstp.cc)
[Frontend](https://cc241001-10736.node.fhstp.cc)

Tools/Services Used:

- Frontend: Next.js, TailwindCSS, TanStack Query, shadcn/ui
- Backend: Express.js, MySQL (Campus DB), JWT for auth, multer + sharp for file uploads
- Database: https://database.atp.fhstp.ac.at/phpmyadmin/
- Documentation: Swagger (/docs/openapi.yaml)

## Source Code

[GitLab Link](https://git.nwt.fhstp.ac.at/cc241001/ss2025_ccl_cc241001)

## Code Documentation

Swagger docs are available for the backend with OpenAPI Specification (OAS) for all the HTTP calls.

## Project Architecture

```
.
├── backend
│   ├── app.js                 # Express app entry point
│   ├── config/                # Configuration files for DB and Swagger
│   │   ├── db.js              # MySQL database connection
│   │   └── swagger.js         # Swagger API docs setup
│   ├── controllers/           # Business logic for routes
│   │   ├── auth.controller.js
│   │   ├── comment.controller.js
│   │   ├── deck.controller.js
│   │   └── ...
│   ├── docs/                  # OpenAPI Specification (Swagger)
│   │   └── openapi.yaml
│   ├── middleware/            # Authentication, validation, error handling
│   │   ├── auth.middleware.js
│   │   ├── rate-limit.middleware.js
│   │   └── ...
│   ├── models/                # Sequelize-like models for DB entities
│   │   ├── user.model.js
│   │   ├── deck.model.js
│   │   └── ...
│   ├── routes/                # API route definitions
│   │   ├── auth.routes.js
│   │   ├── deck.routes.js
│   │   └── ...
│   ├── services/              # Helper functions for business logic
│   │   ├── auth.service.js
│   │   ├── deck.service.js
│   │   └── ...
│   ├── uploads/               # Uploaded images (stored locally)
│   └── utils/                 # Utility helpers (e.g., password hashing)
│       ├── audit.util.js
│       └── password.util.js
│
├── frontend
│   ├── app/                   # Next.js pages and routes
│   │   ├── decks/             # Dynamic routes for viewing/editing decks
│   │   ├── login/             # Login page
│   │   ├── profile/           # User profile pages
│   │   ├── signup/            # Signup page
│   │   └── layout.tsx         # App layout
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # Shadcn/UI and Radix primitives
│   │   ├── deck/              # Deck form and detail components
│   │   ├── admin/             # Admin panel components
│   ├── contexts/              # React contexts (e.g., Auth)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # API helpers and utilities
│   ├── public/                # Static files (images, fonts)
│   ├── styles/                # Global CSS (TailwindCSS)
│   ├── types/                 # TypeScript interfaces and types
│   └── next.config.mjs        # Next.js configuration
```

## User Interaction Overview

### Problem Solved

Dotdeck helps developers discover, share, and manage configuration snippets (dotfiles, CLI tweaks, etc.) without having to sifting through entire repositories or forums which often has invalid or expired links/repos.

### Main Features

- Browse all available decks (snippets)
- Search and filter decks by tags or tools
- View deck details with preview, author info, tags
- Like/dislike decks and comment
- Create, edit, delete your own decks
- Profile pages to view all decks from a user
- Admin panel for managing users, tags, and decks
- Responsive UI with Dark/Light mode toggle

### Main Flow

- Navigate to the frontend URL.
- Sign up or log in (test accounts available).
- Browse or search for snippets.
- Click a deck to view details and copy code.
- Logged-in users can create and edit their decks.
- Admin users can access the admin panel via the profile dropdown.

### Known Issues / Limitations

- Admin functionalities (user banning, tag management) are partially implemented.
- Initial frontend load on npm run dev may hang (refresh fixes this).
- No automated tests yet.

## Accessibility

- Images have text alts
- All functionalities are navigable by keyboard
- Lighthouse score of 90 on Accessibility on both Mobile and Desktop, 100 on Best Practices
