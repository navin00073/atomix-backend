import { createCrudRouter } from '../utils/crudRouter.js';
import { verifyToken } from '../middleware/auth.js';

const { router, store } = createCrudRouter('medicines', { idPrefix: 'MED' });

// POST /api/medicines/:id/adjust-stock  { delta: number }  (negative to deduct)
router.post('/:id/adjust-stock', verifyToken, (req, res) => {
  const existing = store.get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Medicine not found' });

  const delta = Number(req.body?.delta || 0);
  const newQty = Math.max(0, (existing.quantity || 0) + delta);
  const updated = store.update(req.params.id, {
    quantity: newQty,
    isExpiringSoon: existing.isExpiringSoon,
  });
  res.json(updated);
});

export default router;
export { store as medicinesStore };
