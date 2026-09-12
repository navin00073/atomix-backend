import { createCrudRouter } from '../utils/crudRouter.js';
import { verifyToken } from '../middleware/auth.js';

const { router, store } = createCrudRouter('camera_nodes', { idPrefix: 'CAM' });

// POST /api/camera-nodes/:id/anomaly  { anomalyType, location }
router.post('/:id/anomaly', verifyToken, (req, res) => {
  const updated = store.update(req.params.id, {
    anomalyDetected: true,
    anomalyType: req.body?.anomalyType || 'Unknown',
    lastDetection: new Date().toISOString(),
  });
  if (!updated) return res.status(404).json({ error: 'Camera node not found' });
  res.json(updated);
});

// POST /api/camera-nodes/:id/clear-anomaly
router.post('/:id/clear-anomaly', verifyToken, (req, res) => {
  const updated = store.update(req.params.id, { anomalyDetected: false, anomalyType: undefined });
  if (!updated) return res.status(404).json({ error: 'Camera node not found' });
  res.json(updated);
});

export default router;
export { store as cameraStore };
