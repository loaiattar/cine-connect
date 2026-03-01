/**
 * OpenAPI 3.x specification for CinéConnect API.
 * Served at /api/docs via swagger-ui-express.
 */

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "CinéConnect API",
    version: "1.0.0",
    description: "Backend API for CinéConnect: auth, movies, favorites, watchlist, and comments.",
  },
  servers: [
    { url: "/", description: "Current host" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT from POST /api/auth/register or POST /api/auth/login",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string", description: "Error message" },
        },
        required: ["error"],
      },
      ValidationError: {
        type: "object",
        properties: {
          status: { type: "string", example: "error" },
          message: { type: "string", example: "Validation Failed" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          token: { type: "string", description: "JWT for Authorization header" },
          userId: { type: "integer", description: "User ID" },
          email: { type: "string", format: "email" },
        },
        required: ["token", "userId", "email"],
      },
      RegisterBody: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 255 },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
        },
      },
      LoginBody: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 1 },
        },
      },
      ToggleFavoriteBody: {
        type: "object",
        required: ["movieId"],
        properties: {
          movieId: { type: "integer", minimum: 1 },
        },
      },
      ToggleWatchlistBody: {
        type: "object",
        required: ["movieId"],
        properties: {
          movieId: { type: "integer", minimum: 1 },
        },
      },
      AddCommentBody: {
        type: "object",
        required: ["movieId", "comment"],
        properties: {
          movieId: { type: "integer", minimum: 1 },
          comment: { type: "string", minLength: 1, maxLength: 1000 },
        },
      },
      UpdateCommentBody: {
        type: "object",
        required: ["comment"],
        properties: {
          comment: { type: "string", minLength: 1, maxLength: 1000 },
        },
      },
      ToggleActionResponse: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["added", "removed"] },
          movieId: { type: "integer" },
        },
      },
      WatchlistDeleteResponse: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["removed", "not_found"] },
          movieId: { type: "integer" },
        },
      },
      ChatMessage: {
        type: "object",
        properties: {
          id: { type: "integer" },
          senderId: { type: "integer", nullable: true },
          roomId: { type: "string" },
          content: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          senderEmail: { type: "string", nullable: true },
        },
      },
      MessageHistoryResponse: {
        type: "object",
        properties: {
          messages: {
            type: "array",
            items: { $ref: "#/components/schemas/ChatMessage" },
          },
          total: { type: "integer", description: "Total count of messages in the room" },
          limit: { type: "integer" },
          offset: { type: "integer" },
        },
        required: ["messages", "total", "limit", "offset"],
      },
    },
  },
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        description: "Creates an account and returns a JWT. Duplicate email returns 409.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered; returns token and user info",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed (invalid email, short password, etc.)",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } },
            },
          },
          "409": {
            description: "Email already registered",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in",
        description: "Returns a JWT for valid email/password. Invalid credentials return 401.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful; returns token and user info",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/messages": {
      get: {
        tags: ["Messages"],
        summary: "Get message history for a room",
        description: "Returns paginated chat messages for the given room (e.g. global, film:550). Requires authentication.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "room",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Room id (e.g. global, film:550)",
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 100, default: 50 },
          },
          {
            name: "offset",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 0, default: 0 },
          },
        ],
        responses: {
          "200": {
            description: "Paginated message history",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageHistoryResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed (e.g. missing room)",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/movies/{imdbId}": {
      get: {
        tags: ["Movies"],
        summary: "Get movie details",
        description: "Returns movie details (e.g. from TMDB). Optional query userId for favorite/watchlist flags.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "imdbId",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Movie ID (numeric, e.g. TMDB id)",
          },
          {
            name: "userId",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Optional; if provided, response includes user-specific favorite/watchlist flags",
          },
        ],
        responses: {
          "200": { description: "Movie details" },
          "401": {
            description: "Missing or invalid token",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/movies/favorite": {
      post: {
        tags: ["Movies"],
        summary: "Toggle favorite",
        description: "Add or remove a movie from the authenticated user's favorites.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ToggleFavoriteBody" } },
          },
        },
        responses: {
          "200": {
            description: "Toggle result",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ToggleActionResponse" } },
            },
          },
          "400": {
            description: "Validation failed",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } },
          },
          "401": {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/movies/favorites/{userId}": {
      get: {
        tags: ["Movies"],
        summary: "Get user favorites",
        description: "Returns the list of favorite movies for the given user. Caller must be the same user.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "List of favorite entries" },
          "401": {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "403": {
            description: "Forbidden (can only view own favorites)",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/movies/watchlist": {
      post: {
        tags: ["Movies"],
        summary: "Add to watchlist (toggle)",
        description: "Add or remove a movie from the authenticated user's watchlist.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ToggleWatchlistBody" } },
          },
        },
        responses: {
          "200": {
            description: "Toggle result",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ToggleActionResponse" } },
            },
          },
          "400": {
            description: "Validation failed",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } },
          },
          "401": {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/movies/watchlist/{userId}": {
      get: {
        tags: ["Movies"],
        summary: "Get user watchlist",
        description: "Returns the watchlist for the given user. Caller must be the same user.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "List of watchlist entries" },
          "401": {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "403": {
            description: "Forbidden (can only view own watchlist)",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/movies/watchlist/{movieId}": {
      delete: {
        tags: ["Movies"],
        summary: "Remove movie from watchlist",
        description: "Removes the movie from the authenticated user's watchlist.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "movieId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Removed or not_found",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/WatchlistDeleteResponse" } },
            },
          },
          "401": {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/movies/comments/{movieId}": {
      get: {
        tags: ["Movies"],
        summary: "Get comments for a movie",
        description: "Returns all comments for the given movie. Public (no auth required).",
        parameters: [
          {
            name: "movieId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "List of comments" },
          "400": {
            description: "Validation failed",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } },
          },
        },
      },
    },
    "/api/movies/comments": {
      post: {
        tags: ["Movies"],
        summary: "Add a comment",
        description: "Add a comment to a movie. Requires authentication.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/AddCommentBody" } },
          },
        },
        responses: {
          "200": { description: "Created comment" },
          "400": {
            description: "Validation failed",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } },
          },
          "401": {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/movies/comments/{commentId}": {
      delete: {
        tags: ["Movies"],
        summary: "Delete a comment",
        description: "Deletes the comment. Only the comment author can delete.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "commentId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Comment removed" },
          "401": {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "403": {
            description: "Forbidden (not comment owner)",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
      put: {
        tags: ["Movies"],
        summary: "Update a comment",
        description: "Updates the comment text. Only the comment author can update.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "commentId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UpdateCommentBody" } },
          },
        },
        responses: {
          "200": { description: "Comment updated" },
          "400": {
            description: "Validation failed",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } },
          },
          "401": {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "403": {
            description: "Forbidden (not comment owner)",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    // Placeholder for future rating endpoints (issue #05)
    // "/api/movies/{movieId}/rating": { ... }
  },
} as const;
