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
      UserProfile: {
        type: "object",
        description: "Profile for the current user",
        properties: {
          id: { type: "integer" },
          userId: { type: "integer" },
          bio: { type: "string", nullable: true },
          avatarUrl: { type: "string", nullable: true },
          location: { type: "string", nullable: true },
          favoriteGenre: { type: "string", nullable: true },
        },
      },
      UserMeResponse: {
        type: "object",
        description: "Current user and profile",
        properties: {
          user: {
            type: "object",
            properties: {
              id: { type: "integer" },
              name: { type: "string", nullable: true },
              email: { type: "string" },
              createdAt: { type: "string", format: "date-time", nullable: true },
            },
          },
          profile: { oneOf: [{ $ref: "#/components/schemas/UserProfile" }, { type: "null" }] },
        },
        required: ["user"],
      },
      UpdateProfileBody: {
        type: "object",
        description: "Optional profile fields to update",
        properties: {
          bio: { type: "string", maxLength: 500 },
          avatarUrl: { type: "string", format: "uri" },
          location: { type: "string", maxLength: 255 },
          favoriteGenre: { type: "string", maxLength: 100 },
        },
      },
      FollowBody: {
        type: "object",
        required: ["followingId"],
        properties: {
          followingId: { type: "integer", minimum: 1, description: "User ID to follow" },
        },
      },
      FollowRow: {
        type: "object",
        properties: {
          followerId: { type: "integer" },
          followingId: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      FollowListUser: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string", nullable: true },
          email: { type: "string" },
          createdAt: { type: "string", format: "date-time", nullable: true },
          followedAt: { type: "string", format: "date-time" },
          avatarUrl: { type: "string", nullable: true },
        },
      },
      FollowersResponse: {
        type: "object",
        properties: {
          users: { type: "array", items: { $ref: "#/components/schemas/FollowListUser" } },
          total: { type: "integer" },
          limit: { type: "integer" },
          offset: { type: "integer" },
        },
        required: ["users", "total", "limit", "offset"],
      },
      UserSearchUser: {
        type: "object",
        description: "Public user summary for search (no email)",
        properties: {
          id: { type: "integer" },
          name: { type: "string", nullable: true },
          avatarUrl: { type: "string", nullable: true },
        },
        required: ["id", "name", "avatarUrl"],
      },
      UserSearchResponse: {
        type: "object",
        properties: {
          users: { type: "array", items: { $ref: "#/components/schemas/UserSearchUser" } },
          total: { type: "integer" },
          limit: { type: "integer" },
          offset: { type: "integer" },
        },
        required: ["users", "total", "limit", "offset"],
      },
      PublicProfileStats: {
        type: "object",
        description: "Follower counts for a user profile",
        properties: {
          followersCount: { type: "integer", minimum: 0 },
          followingCount: { type: "integer", minimum: 0 },
        },
        required: ["followersCount", "followingCount"],
      },
      PublicUserByIdResponse: {
        type: "object",
        description: "Public profile by user id (no email). Send optional Bearer token to receive isFollowing when viewing another user.",
        properties: {
          user: {
            type: "object",
            properties: {
              id: { type: "integer" },
              name: { type: "string", nullable: true },
              createdAt: { type: "string", format: "date-time", nullable: true },
            },
            required: ["id", "name", "createdAt"],
          },
          profile: { oneOf: [{ $ref: "#/components/schemas/UserProfile" }, { type: "null" }] },
          stats: { $ref: "#/components/schemas/PublicProfileStats" },
          isFollowing: { type: "boolean", description: "Only when authenticated viewer is not the target user" },
        },
        required: ["user", "profile", "stats"],
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
      SubmitRatingBody: {
        type: "object",
        required: ["movieId", "rating"],
        properties: {
          movieId: { type: "integer", minimum: 1, description: "Movie ID (e.g. TMDB id)" },
          rating: { type: "integer", minimum: 1, maximum: 10, description: "Rating 1–10" },
        },
      },
      SubmitRatingResponse: {
        type: "object",
        properties: {
          movieId: { type: "integer" },
          rating: { type: "integer" },
        },
        required: ["movieId", "rating"],
      },
      MovieRatingResponse: {
        type: "object",
        description: "Aggregate and optionally the authenticated user's rating",
        properties: {
          userRating: { type: "integer", nullable: true, description: "Current user's rating (only when authenticated)" },
          average: { type: "number", description: "Average rating for the film" },
          count: { type: "integer", description: "Number of ratings" },
        },
        required: ["average", "count"],
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
    "/api/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get current user and profile",
        description: "Returns the authenticated user and their profile. Requires JWT.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "User and profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserMeResponse" },
              },
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
      put: {
        tags: ["Users"],
        summary: "Update current user profile",
        description: "Updates the authenticated user's profile (bio, avatarUrl, location, favoriteGenre). All fields optional.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProfileBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserProfile" },
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
            description: "Unauthorized",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/users/search": {
      get: {
        tags: ["Users"],
        summary: "Search users by name or email",
        description:
          "Returns public fields only (id, name, avatarUrl). Email is used for matching but never exposed. No authentication required.",
        parameters: [
          { name: "q", in: "query", required: false, schema: { type: "string", maxLength: 100 }, description: "Search term" },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
          { name: "offset", in: "query", schema: { type: "integer", minimum: 0, default: 0 } },
        ],
        responses: {
          "200": {
            description: "Paginated search results",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/UserSearchResponse" } },
            },
          },
          "400": {
            description: "Validation failed (e.g. q too long)",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } },
            },
          },
        },
      },
    },
    "/api/users/{userId}": {
      get: {
        tags: ["Users"],
        summary: "Get public user profile by ID",
        description:
          "Returns name, profile fields (bio, avatar, etc.), and follower/following counts. No email. Optional JWT: when viewing another user, response includes isFollowing for the current user.",
        parameters: [
          { name: "userId", in: "path", required: true, schema: { type: "integer", minimum: 1 } },
        ],
        security: [],
        responses: {
          "200": {
            description: "Public profile",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/PublicUserByIdResponse" } },
            },
          },
          "404": {
            description: "User not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/follows": {
      post: {
        tags: ["Follows"],
        summary: "Follow a user",
        description: "Authenticated user follows the user with the given ID. Cannot follow yourself. Returns 409 if already following.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/FollowBody" } },
          },
        },
        responses: {
          "201": {
            description: "Follow created",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/FollowRow" } },
            },
          },
          "400": {
            description: "Validation failed or cannot follow yourself",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "401": {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "404": {
            description: "User not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "409": {
            description: "Already following this user",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/follows/{userId}": {
      delete: {
        tags: ["Follows"],
        summary: "Unfollow a user",
        description: "Authenticated user unfollows the user with the given ID.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "userId", in: "path", required: true, schema: { type: "integer" }, description: "User ID to unfollow" },
        ],
        responses: {
          "200": {
            description: "Unfollowed (or was not following)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { unfollowed: { type: "boolean" } },
                  required: ["unfollowed"],
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/users/{userId}/followers": {
      get: {
        tags: ["Users"],
        summary: "List followers",
        description: "Returns users who follow the given user. Paginated. Public (no auth required).",
        parameters: [
          { name: "userId", in: "path", required: true, schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 50 } },
          { name: "offset", in: "query", schema: { type: "integer", minimum: 0, default: 0 } },
        ],
        responses: {
          "200": {
            description: "Paginated list of followers",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/FollowersResponse" } },
            },
          },
          "404": {
            description: "User not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/users/{userId}/following": {
      get: {
        tags: ["Users"],
        summary: "List following",
        description: "Returns users that the given user is following. Paginated. Public (no auth required).",
        parameters: [
          { name: "userId", in: "path", required: true, schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 50 } },
          { name: "offset", in: "query", schema: { type: "integer", minimum: 0, default: 0 } },
        ],
        responses: {
          "200": {
            description: "Paginated list of following",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/FollowersResponse" } },
            },
          },
          "404": {
            description: "User not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
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
    "/api/movies/{movieId}": {
      get: {
        tags: ["Movies"],
        summary: "Get movie details",
        description: "Returns movie details (e.g. from TMDB). Optional query userId for favorite/watchlist flags.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "movieId",
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
    "/api/movies/rate": {
      post: {
        tags: ["Movies"],
        summary: "Submit or update rating",
        description: "Upsert the authenticated user's rating for a film (1–10). One rating per user per film.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/SubmitRatingBody" } },
          },
        },
        responses: {
          "200": {
            description: "Rating saved",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/SubmitRatingResponse" } },
            },
          },
          "400": {
            description: "Validation failed (e.g. rating out of 1–10)",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } },
          },
          "401": {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/api/movies/rating/{movieId}": {
      get: {
        tags: ["Movies"],
        summary: "Get rating for a film",
        description: "Returns aggregate (average, count) for the film. When authenticated, also returns the current user's rating.",
        security: [],
        parameters: [
          {
            name: "movieId",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Movie ID (e.g. TMDB id)",
          },
        ],
        responses: {
          "200": {
            description: "Rating data",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/MovieRatingResponse" } },
            },
          },
          "400": {
            description: "Validation failed",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } },
          },
        },
      },
    },
  },
} as const;
