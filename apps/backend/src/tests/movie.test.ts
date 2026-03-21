import { describe, it, expect, beforeEach, vi } from 'vitest';

import request from 'supertest';

import app from '../app';

import { AuthService } from '../services/auth.service';

vi.mock('../services/tmdb.service', async (importOriginal) => {
    const mod = await importOriginal<typeof import('../services/tmdb.service')>();
    return {
        ...mod,
        TmdbService: {
            ...mod.TmdbService,
            searchMovies: vi.fn().mockResolvedValue({
                page: 1,
                results: [
                    {
                        id: 27205,
                        title: 'Inception',
                        poster_path: '/path',
                        release_date: '2010-07-15',
                        vote_average: 8.4,
                        genre_ids: [28, 878],
                    },
                ],
                total_pages: 1,
                total_results: 1,
            }),
        },
    };
});


describe('Movie Functional Tests - Favorites', () => {

    let userToken: string;

    let userId: number;

    const movieId = 550;

    beforeEach(async () => {

        const auth = await AuthService.register('testuser', `test-${Date.now()}@example.com`, 'password123');

        userToken = auth.token;

        userId = auth.userId;

    });


    it('should add a movie to favorites', async () => {

        const response = await request(app)

            .post('/api/movies/favorite')

            .set('Authorization', `Bearer ${userToken}`)

            .send({ movieId });


        expect(response.status).toBe(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.action).toBe('added');

        expect(response.body.data.movieId).toBe(movieId);

    });


    it('should remove a movie from favorites if it already exists', async () => {

        // First add it to ensure it exists

        await request(app)

            .post('/api/movies/favorite')

            .set('Authorization', `Bearer ${userToken}`)

            .send({ movieId });


        const response = await request(app)

            .post('/api/movies/favorite')

            .set('Authorization', `Bearer ${userToken}`)

            .send({ movieId });


        expect(response.status).toBe(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.action).toBe('removed');

    });

});


describe('Movie Functional Tests - Watchlist', () => {

    let userToken: string;

    let userId: number;

    const movieId = 550;


    beforeEach(async () => {

        const auth = await AuthService.register('testuser', `test-${Date.now()}@example.com`, 'password123');

        userToken = auth.token;

        userId = auth.userId;

    });


    it('should add a movie to watchlist', async () => {

        const response = await request(app)

            .post('/api/movies/watchlist')

            .set('Authorization', `Bearer ${userToken}`)

            .send({ movieId });


        expect(response.status).toBe(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.action).toBe('added');

        expect(response.body.data.movieId).toBe(movieId);

    });


    it('should remove a movie from watchlist if it already exists', async () => {

        await request(app)

            .post('/api/movies/watchlist')

            .set('Authorization', `Bearer ${userToken}`)

            .send({ movieId });


        const response = await request(app)

            .post('/api/movies/watchlist')

            .set('Authorization', `Bearer ${userToken}`)

            .send({ movieId });


        expect(response.status).toBe(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.action).toBe('removed');

    });


    it('should fetch the user watchlist', async () => {

        await request(app)

            .post('/api/movies/watchlist')

            .set('Authorization', `Bearer ${userToken}`)

            .send({ movieId });


        const response = await request(app)

            .get(`/api/movies/watchlist/${userId}`)

            .set('Authorization', `Bearer ${userToken}`);


        expect(response.status).toBe(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.some((item: any) => item.externalMovieId === movieId)).toBe(true);

    });


    it('should delete a movie from watchlist', async () => {

        await request(app)

            .post('/api/movies/watchlist')

            .set('Authorization', `Bearer ${userToken}`)

            .send({ movieId });


        const response = await request(app)

            .delete(`/api/movies/watchlist/${movieId}`)

            .set('Authorization', `Bearer ${userToken}`);


        expect(response.status).toBe(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.action).toBe('removed');

    });

    it('should return 403 when fetching another users watchlist', async () => {

        const otherUser = await AuthService.register('otheruser', 'other@example.com', 'password123');


        const response = await request(app)

            .get(`/api/movies/watchlist/${otherUser.userId}`)

            .set('Authorization', `Bearer ${userToken}`);


        expect(response.status).toBe(403);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('Unauthorized');

    });

    it('should add a comment to a movie', async () => {
        const commentText = "This movie is a masterpiece!";

        const response = await request(app)
            .post('/api/movies/comments')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ movieId, comment: commentText });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.comment).toBe(commentText);
        expect(response.body.data.userId).toBe(userId);
    });

    it('should fetch all comments for a movie', async () => {
        await request(app)
            .post('/api/movies/comments')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ movieId, comment: "First comment" });

        const response = await request(app)
            .get(`/api/movies/comments/${movieId}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body.data[0]).toHaveProperty('comment');
    });

    it('should NOT allow deleting another user\'s comment', async () => {
        const commentRes = await request(app)
            .post('/api/movies/comments')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ movieId, comment: "I own this comment" });

        const commentId = commentRes.body.data.id;

        const hacker = await AuthService.register('hacker', `hacker-${Date.now()}@example.com`, 'password123');

        const response = await request(app)
            .delete(`/api/movies/comments/${commentId}`)
            .set('Authorization', `Bearer ${hacker.token}`);

        expect(response.status).toBe(403);
    });

    it('should notify followers when the author adds a comment', async () => {
        const mid = 551;
        const follower = await AuthService.register('Follower', `fol-${Date.now()}@example.com`, 'password123');
        const author = await AuthService.register('Author', `auth-${Date.now()}@example.com`, 'password123');

        await request(app)
            .post('/api/follows')
            .set('Authorization', `Bearer ${follower.token}`)
            .send({ followingId: author.userId });

        const commentRes = await request(app)
            .post('/api/movies/comments')
            .set('Authorization', `Bearer ${author.token}`)
            .send({ movieId: mid, comment: 'Hello followers' });

        expect(commentRes.status).toBe(200);

        const notifRes = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${follower.token}`)
            .query({ limit: 20 });

        expect(notifRes.status).toBe(200);
        expect(notifRes.body.success).toBe(true);
        const list = notifRes.body.data?.notifications ?? [];
        expect(
            list.some(
                (n: { message: string; linkType?: string | null; targetId?: number | null }) =>
                    n.message.includes('commentaire') && n.linkType === 'movie' && n.targetId === mid
            )
        ).toBe(true);
    });

});

describe('Movie Functional Tests - Search', () => {
    let searchToken: string;

    beforeEach(async () => {
        const auth = await AuthService.register('searchuser', `search-${Date.now()}@example.com`, 'password123');
        searchToken = auth.token;
    });

    it('should return 400 when search query is missing', async () => {
        const response = await request(app)
            .get('/api/movies/search')
            .set('Authorization', `Bearer ${searchToken}`);
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
    });

    it('should return paginated search results for a valid query', async () => {
        const response = await request(app)
            .get('/api/movies/search')
            .set('Authorization', `Bearer ${searchToken}`)
            .query({ q: 'inception' });
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('page');
        expect(response.body.data).toHaveProperty('results');
        expect(response.body.data).toHaveProperty('total_pages');
        expect(response.body.data).toHaveProperty('total_results');
        expect(Array.isArray(response.body.data.results)).toBe(true);
    });

    it('should accept optional page and genre params', async () => {
        const response = await request(app)
            .get('/api/movies/search')
            .set('Authorization', `Bearer ${searchToken}`)
            .query({ q: 'matrix', page: 1 });
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.page).toBe(1);
        expect(Array.isArray(response.body.data.results)).toBe(true);
    });
});   