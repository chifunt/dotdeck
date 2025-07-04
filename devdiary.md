# Dev Diary

## Day Nr. 1 – 2025-06-10

- ✅ What I worked on today:
  Initialized frontend and backend projects. Set up basic project structure and version control (Git). Added a gitignore and prepared dev environment.
- 💡 Biggest learning:
  Planning a good project folder structure from the start saves time later if stuff goes wrong and messy.
- ❌ Biggest mistake/blocker:
  None yet cause this was mostly setup and preparation.
- 📌 Notes for tomorrow:
  Finish Figma prototype and finalize which features are gonna be on the app.

## Day Nr. 2 – 2025-06-11

- ✅ What I worked on today:
  Finished the visual prototype in Figma. Focused on styling the design with a color palette and finalizing all the features I want for the app that I can realistically implement within the time.
- 💡 Biggest learning:
  Good UI/UX design decisions and foundations would probably be really good for future me working on it as design can be quite the wayward soul.
- ❌ Biggest mistake/blocker:
  Spending too much time thinking about the design instead of trying stuff out and messing around cause I want it to be easy to implement in code.
- 📌 Notes for tomorrow:
  Start implementing backend API and frontend layout.

## Day Nr. 3 – 2025-06-12

- ✅ What I worked on today:
  Set up Express backend and React frontend base. Configured TailwindCSS and Vite. Added dev scripts and API proxy.
- 💡 Biggest learning:
  How to connect React to Express using Vite’s devServer proxy.
- ❌ Biggest mistake/blocker:
  Spent too long messing with API calls and "/api" prefix cause I'm planning to have it all run under one node instance.
- 📌 Notes for tomorrow:
  Start building backend API routes and database models.

## Day Nr. 4 – 2025-06-13

- ✅ What I worked on today:
  Implemented backend API routes for decks, users, and comments. Added DB models and validation. Set up file uploads and optimization with Sharp.
- 💡 Biggest learning:
  Processing and compressing images decently with Sharp.
- ❌ Biggest mistake/blocker:
  File type validation, messing around with that and dumping things to make it easier for myself.
- 📌 Notes for tomorrow:
  Document APIs with Swagger and test error handling with Postman.

## Day Nr. 5 – 2025-06-14

- ✅ What I worked on today:
  Added Swagger API docs. Implemented role-based access control, banning, and rate limiting. Hardened thumbnail upload logic.
- 💡 Biggest learning:
  Middleware chaining in Express makes security checks much cleaner.
- ❌ Biggest mistake/blocker:
  Accidentally let banned users call APIs-fixed with middleware.
- 📌 Notes for tomorrow:
  More polish on the backend.

## Day Nr. 6 – 2025-06-16

- ✅ What I worked on today:
  Implemented pagination and full-text search on decks. Built user page to list decks by author. Full on testing setup with Postman and Swagger.
- 💡 Biggest learning:
  Indexing is key for fast full-text search with pagination.
- ❌ Biggest mistake/blocker:
  Search bar caused 422 errors on empty inputs—added validation.
- 📌 Notes for tomorrow:
  Build frontend components and polish UI layout.

## Day Nr. 7 – 2025-06-17

- ✅ What I worked on today:
  Designed frontend UI with Rose Pine theme. Built navbar, deck cards, and profile page layout.
- 💡 Biggest learning:
  Tailwind made prototyping fast and consistent but it's tough having so many classes everywhere.
- ❌ Biggest mistake/blocker:
  Trying to structure my frontend too early and making it so convoluted too quick.
- 📌 Notes for tomorrow:
  Implement like/dislike functionality on frontend and backend.

## Day Nr. 8 – 2025-06-18

- ✅ What I worked on today:
  Completed like/dislike system. Added session restoration and thumbnail uploads with React Dropzone.
- 💡 Biggest learning:
  Session persistence across reloads improves UX a bunch.
- ❌ Biggest mistake/blocker:
  Dropzone didn’t handle large file rejections initially—added size check. Also the UI didn't look very good, so many things not working on the frontend.
- 📌 Notes for tomorrow:
  Work on deck editing and deleting functionality. Try out v0 by Vercel as suggested by The Maker.

## Day Nr. 9 – 2025-06-19

- ✅ What I worked on today:
  Added deck editing, comment deletion, and tag management. Improved accessibility (clickable deck cards, focus states). Dumped the whole frontend and made a new one based on Next.js that looks so much nicer. Simplified deck details on profile page to lessen work. Fixed SQL query errors and polished UX for deck/comment deletion. Attempted to host in one single node instance but found it impossible after a few hours of trying different things because some server side rendering is done with Next.js, can't just compile it like with plain react.
- 💡 Biggest learning:
  Small accessibility tweaks make a big difference in the overall experience. I should have really thought of the backend more... so much were missing.
- ❌ Biggest mistake/blocker:
  Backend upload routes failed due to import issues-resolved quickly. Do not use the high model of v0, super expensive and still terrible. API error responses were inconsistent, standardized them. The backend was still lacking so much, full of stuff I didn't think of.
- 📌 Notes for tomorrow:
  Polish UI and test app thoroughly before the presentation tomorrow.

## Day Nr. 10 – 2025-06-20

- ✅ What I worked on today:
  Presented the app, have people test it out.
- 💡 Biggest learning:
  Note down all the things from testing.
- ❌ Biggest mistake/blocker:
  Lack of noting down the things from testing so I forgor.
- 📌 Notes for tomorrow:
  Finish up the documentation and fix some bugs.

## Day Nr. 11 – 2025-07-04

- ✅ What I worked on today:
  Final polish before submission. Fixed thumbnail editing for decks without thumbnails, improved “Back to Decks” button, and polished accessibility. Did all the markdown files required for submission.
- 💡 Biggest learning:
  Much there is still out there for me to learn, this was but a small mess of a project.
- ❌ Biggest mistake/blocker:
  Figuring out the reason why editing is a bit buggy.
- 📌 Notes for tomorrow:
  No more tomorrow for this project, final submission.

---

## 🌟 Final Personal Reflection

### 🌟 What worked well for you during the CCL?

The whole project went quite well I would say, I managed to make the MVP that feels quite well to use.

### 🧩 What were your biggest challenges or struggles?

I structured my code too much, with early documentation that I would just dump later on because I made them a bit too early. Working with TypeScript on the frontend as well as Next.js is also a new experience for me. Trying to figure out the stuff for stretch goals or banging my head against the wall for things that I would just throw away in its entirety so much.

### 🔍 What did you manage to understand better during these two weeks?

REST API design, especially around middleware, error handling, and permissions. On the frontend, I learned more about managing state in React and building accessible, reusable components. A better understanding of using AI for development, especially when codebase is pretty big. Knowing better what design decisions to take when creating web apps overall.

### 🕳️ What do you still struggle with?

Time management, making good design decisions for software development early on, Figuring out which problems to most focus on, database design early on, testing in different environemnts.

### 🚀 Looking back to the start of the semester: Did you think you’d be able to build the app you delivered? Why or why not?

I haven't really done a full stack web app before, so this is a first for me. But doing it made me learn so much with all the stupid mistakes I made along the way. I do not think that I would have been able to make a web app with as much polish as I do know without the knowledge I gained over the semester. I am much more confident in being able to make better and more efficient design decisions.
