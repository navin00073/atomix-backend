import { createCrudRouter } from '../utils/crudRouter.js';
import { verifyToken } from '../middleware/auth.js';

const { router, store } = createCrudRouter('robots', { idPrefix: 'RB' });

// POST /api/robots/:id/dispatch  { mission: RobotMission }
router.post('/:id/dispatch', verifyToken, (req, res) => {
  const robot = store.get(req.params.id);
  if (!robot) return res.status(404).json({ error: 'Robot not found' });

  const mission = req.body?.mission || {};
  const updated = store.update(req.params.id, {
    status: 'En Route',
    currentMission: { ...mission, status: 'Dispatched', dispatchedAt: new Date().toISOString() },
    targetWard: mission.ward || robot.targetWard,
  });
  res.json(updated);
});

// POST /api/robots/:id/status  { status, currentLocation, currentCheckpointIndex }
router.post('/:id/status', verifyToken, (req, res) => {
  const updated = store.update(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: 'Robot not found' });
  res.json(updated);
});

export default router;
export { store as robotsStore };
