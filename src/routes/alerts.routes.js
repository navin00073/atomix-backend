import { createCrudRouter } from '../utils/crudRouter.js';
import { verifyToken } from '../middleware/auth.js';

const { router, store } = createCrudRouter('alerts', { idPrefix: 'ALT' });

// POST /api/alerts/:id/read
router.post('/:id/read', verifyToken, (req, res) => {
  const updated = store.update(req.params.id, { isRead: true });
  if (!updated) return res.status(404).json({ error: 'Alert not found' });
  res.json(updated);
});

export default router;
export { store as alertsStore };
