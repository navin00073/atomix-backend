import { createCrudRouter } from '../utils/crudRouter.js';
import { verifyToken } from '../middleware/auth.js';

const { router, store } = createCrudRouter('staff', { idPrefix: 'STF' });

// POST /api/staff/:id/check-in
router.post('/:id/check-in', verifyToken, (req, res) => {
  const updated = store.update(req.params.id, {
    status: 'Present',
    checkInTime: new Date().toISOString(),
  });
  if (!updated) return res.status(404).json({ error: 'Staff member not found' });
  res.json(updated);
});

// POST /api/staff/:id/check-out
router.post('/:id/check-out', verifyToken, (req, res) => {
  const updated = store.update(req.params.id, { status: 'Checked Out' });
  if (!updated) return res.status(404).json({ error: 'Staff member not found' });
  res.json(updated);
});

export default router;
export { store as staffStore };
