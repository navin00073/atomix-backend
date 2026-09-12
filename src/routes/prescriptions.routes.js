import { createCrudRouter } from '../utils/crudRouter.js';
import { verifyToken } from '../middleware/auth.js';

const { router, store } = createCrudRouter('prescriptions', { idPrefix: 'RX' });

const TIMESTAMP_FIELD = {
  Verified: 'verifiedAt',
  Dispensed: 'dispensedAt',
  Delivered: 'deliveredAt',
};

// POST /api/prescriptions/:id/status  { status }
router.post('/:id/status', verifyToken, (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: 'status is required' });

  const patch = { status };
  const tsField = TIMESTAMP_FIELD[status];
  if (tsField) patch[tsField] = new Date().toISOString();

  const updated = store.update(req.params.id, patch);
  if (!updated) return res.status(404).json({ error: 'Prescription not found' });
  res.json(updated);
});

export default router;
export { store as prescriptionsStore };
