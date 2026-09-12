import { createCrudRouter } from '../utils/crudRouter.js';
import { verifyToken } from '../middleware/auth.js';

const { router, store } = createCrudRouter('visits', { idPrefix: 'VST' });

// POST /api/visits/:id/vitals  { vitals: Vitals }
router.post('/:id/vitals', verifyToken, (req, res) => {
  const updated = store.update(req.params.id, { vitals: req.body?.vitals });
  if (!updated) return res.status(404).json({ error: 'Visit not found' });
  res.json(updated);
});

// POST /api/visits/:id/status  { status }
router.post('/:id/status', verifyToken, (req, res) => {
  const patch = { status: req.body?.status };
  if (req.body?.status === 'Completed') patch.completedAt = new Date().toISOString();
  const updated = store.update(req.params.id, patch);
  if (!updated) return res.status(404).json({ error: 'Visit not found' });
  res.json(updated);
});

export default router;
export { store as visitsStore };
