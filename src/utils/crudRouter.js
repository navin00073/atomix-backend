import { Router } from 'express';
import { createCollectionStore } from './collectionStore.js';
import { verifyToken } from '../middleware/auth.js';

/**
 * Builds a standard REST router (list/get/create/update/patch/delete)
 * for a JSON-document collection table. Every route requires auth.
 *
 * Supports simple equality filtering via query params, e.g.
 * GET /api/patients?status=Waiting
 */
export function createCrudRouter(table, { idPrefix = 'ID' } = {}) {
  const store = createCollectionStore(table);
  const router = Router();

  router.use(verifyToken);

  router.get('/', (req, res) => {
    const filters = req.query;
    const filterFn = Object.keys(filters).length
      ? (doc) => Object.entries(filters).every(([k, v]) => String(doc[k]) === String(v))
      : null;
    res.json(store.list(filterFn));
  });

  router.get('/:id', (req, res) => {
    const doc = store.get(req.params.id);
    if (!doc) return res.status(404).json({ error: `${table} record not found` });
    res.json(doc);
  });

  router.post('/', (req, res) => {
    const created = store.create(req.body || {}, idPrefix);
    res.status(201).json(created);
  });

  router.put('/:id', (req, res) => {
    const updated = store.replace(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ error: `${table} record not found` });
    res.json(updated);
  });

  router.patch('/:id', (req, res) => {
    const updated = store.update(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ error: `${table} record not found` });
    res.json(updated);
  });

  router.delete('/:id', (req, res) => {
    const ok = store.delete(req.params.id);
    if (!ok) return res.status(404).json({ error: `${table} record not found` });
    res.status(204).send();
  });

  return { router, store };
}
