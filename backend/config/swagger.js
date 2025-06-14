/**
 * @file config/swagger.js
 * @description
 *   Centralized OpenAPI (Swagger) setup for Dotdeck API (v1).
 *   Uses swagger-jsdoc to generate the spec from JSDoc comments and static YAML definitions.
 *
 *   - JSDoc annotations in route files describe endpoints, parameters, and responses.
 *   - Static docs (e.g. components or examples) can be authored in docs/openapi.yaml.
 *
 * @example
 *   // In your Express app initialization:
 *   import swaggerUi from 'swagger-ui-express';
 *   import { swaggerSpec } from './config/swagger.js';
 *   app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
 */

import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

// -----------------------------------------------------------------------------
// Configuration options for swagger-jsdoc
// -----------------------------------------------------------------------------
const swaggerOptions = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Dotdeck API",
      version: "1.0.0",
      description: "Comprehensive documentation for the Dotdeck REST API.",
      contact: {
        name: "Dotdeck Support",
        email: "support@dotdeck.example.com",
      },
    },
    servers: [
      {
        url: "/api/v1",
        description: "Primary API server mounted at /api/v1",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter your JWT token in the format **Bearer &lt;token>**",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: "Auth", description: "User sign-up and login flows" },
      { name: "Decks", description: "Manage code decks (CRUD)" },
      { name: "Comments", description: "Flat comment threads on decks" },
      { name: "Ratings", description: "Thumbs-up/thumbs-down votes" },
      { name: "Tags", description: "Public tag listing" },
      {
        name: "Admin",
        description:
          "Site-wide administration (banning, tag management, audit)",
      },
      {
        name: "Moderation",
        description: "Moderator-only actions (soft deletes)",
      },
      { name: "Users", description: "Current user profile retrieval" },
    ],
  },
  apis: [
    // JSDoc-annotated route definitions
    path.resolve(process.cwd(), "routes/**/*.js"),
    // Static OpenAPI fragments (schemas, examples) if any
    path.resolve(process.cwd(), "docs/openapi.yaml"),
  ],
};

/**
 * swaggerSpec
 * @type {object}
 * @description Generated OpenAPI specification for Swagger UI and other tools.
 */
export const swaggerSpec = swaggerJsdoc(swaggerOptions);
