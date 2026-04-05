import { StatusCodes } from 'http-status-codes';
import { request } from '../lib';
import {
  articlesRoutes,
  categoriesRoutes,
  commentsRoutes,
  usersRoutes,
} from '../endpoints';
import { describe, it, expect } from '@jest/globals';

const headers = { Accept: 'application/json' };

describe('Custom: pagination & sort (e2e)', () => {
  describe('legacy list shape (no page/limit)', () => {
    it('GET /user returns a plain array', async () => {
      const res = await request.get(usersRoutes.getAll).set(headers);
      expect(res.status).toBe(StatusCodes.OK);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /category returns a plain array', async () => {
      const res = await request.get(categoriesRoutes.getAll).set(headers);
      expect(res.status).toBe(StatusCodes.OK);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /article returns a plain array', async () => {
      const res = await request.get(articlesRoutes.getAll).set(headers);
      expect(res.status).toBe(StatusCodes.OK);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('paginated shape (page and/or limit)', () => {
    it('GET /user?page=1&limit=1 returns { total, page, limit, data }', async () => {
      const res = await request
        .get(`${usersRoutes.getAll}?page=1&limit=1`)
        .set(headers);
      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body).toMatchObject({
        page: 1,
        limit: 1,
        total: expect.any(Number),
      });
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /category?limit=2 returns paginated wrapper', async () => {
      const res = await request
        .get(`${categoriesRoutes.getAll}?limit=2`)
        .set(headers);
      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body).toMatchObject({
        limit: 2,
        total: expect.any(Number),
        page: expect.any(Number),
      });
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /article with filter + pagination', async () => {
      const res = await request
        .get(`${articlesRoutes.getAll}?status=draft&page=1&limit=5`)
        .set(headers);
      expect(res.status).toBe(StatusCodes.OK);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toMatchObject({
        total: expect.any(Number),
        page: 1,
        limit: 5,
      });
    });

    it('GET /comment?articleId=…&page=1&limit=1', async () => {
      const userRes = await request
        .post(usersRoutes.create)
        .set(headers)
        .send({ login: 'PAG_USER', password: 'PAG_PASS' });
      expect(userRes.status).toBe(StatusCodes.CREATED);
      const userId = userRes.body.id;

      const articleRes = await request
        .post(articlesRoutes.create)
        .set(headers)
        .send({
          title: 'PAG_ARTICLE',
          content: 'c',
          status: 'draft',
          authorId: userId,
          categoryId: null,
          tags: [],
        });
      expect(articleRes.status).toBe(StatusCodes.CREATED);
      const articleId = articleRes.body.id;

      await request.post(commentsRoutes.create).set(headers).send({
        content: 'c1',
        articleId,
        authorId: null,
      });
      await request.post(commentsRoutes.create).set(headers).send({
        content: 'c2',
        articleId,
        authorId: null,
      });

      const listRes = await request
        .get(`${commentsRoutes.getByArticle(articleId)}&page=1&limit=1`)
        .set(headers);
      expect(listRes.status).toBe(StatusCodes.OK);
      expect(listRes.body.total).toBeGreaterThanOrEqual(2);
      expect(listRes.body.data).toHaveLength(1);

      await request.delete(articlesRoutes.delete(articleId)).set(headers);
      await request.delete(usersRoutes.delete(userId)).set(headers);
    });
  });

  describe('sorting (sortBy + order)', () => {
    it('GET /category?sortBy=name&order=desc returns sorted plain array', async () => {
      const a = await request
        .post(categoriesRoutes.create)
        .set(headers)
        .send({ name: 'AAA_SORT', description: 'a' });
      const b = await request
        .post(categoriesRoutes.create)
        .set(headers)
        .send({ name: 'ZZZ_SORT', description: 'z' });
      expect(a.status).toBe(StatusCodes.CREATED);
      expect(b.status).toBe(StatusCodes.CREATED);

      const res = await request
        .get(`${categoriesRoutes.getAll}?sortBy=name&order=desc`)
        .set(headers);
      expect(res.status).toBe(StatusCodes.OK);
      expect(Array.isArray(res.body)).toBe(true);
      const data = res.body as Array<{ name: string }>;
      const rowZ = data.find((c) => c.name === 'ZZZ_SORT');
      const rowA = data.find((c) => c.name === 'AAA_SORT');
      expect(rowZ).toBeDefined();
      expect(rowA).toBeDefined();
      expect(data.indexOf(rowZ!)).toBeLessThan(data.indexOf(rowA!));

      await request.delete(categoriesRoutes.delete(a.body.id)).set(headers);
      await request.delete(categoriesRoutes.delete(b.body.id)).set(headers);
    });
  });
});
