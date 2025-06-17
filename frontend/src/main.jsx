/**
 * @file Vite boot-strapper.
 * Mounts <App/> into #root with React 18’s “createRoot”.
 */

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./app";
import "./index.css"; // Tailwind + design-tokens

// React 18 concurrent renderer.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
