import { createCrudRouter } from '../utils/crudRouter.js';
import { verifyToken } from '../middleware/auth.js';

const { router, store } = createCrudRouter('emergencies', { idPrefix: 'EMG' });

function addStageHistory(emergency, stage, title, actor) {
  const history = emergency.stageHistory || [];
  return [
    ...history,
    { stage, title, timestamp: new Date().toISOString(), actor, completed: true },
  ];
}

// POST /api/emergencies/:id/advance-stage  { title?, actor? }
router.post('/:id/advance-stage', verifyToken, (req, res) => {
  const emergency = store.get(req.params.id);
  if (!emergency) return res.status(404).json({ error: 'Emergency not found' });

  const nextStage = Math.min(7, (emergency.currentStage || 1) + 1);
  const actor = req.body?.actor || req.user.name;
  const title = req.body?.title || `Stage ${nextStage}`;

  const updated = store.update(req.params.id, {
    currentStage: nextStage,
    stageHistory: addStageHistory(emergency, nextStage, title, actor),
    status: nextStage >= 7 ? 'AT_SCENE' : emergency.status,
  });
  res.json(updated);
});

// POST /api/emergencies/:id/assign-doctor  { doctor: {...} }
router.post('/:id/assign-doctor', verifyToken, (req, res) => {
  const updated = store.update(req.params.id, { assignedDoctor: req.body?.doctor });
  if (!updated) return res.status(404).json({ error: 'Emergency not found' });
  res.json(updated);
});

// POST /api/emergencies/:id/assign-nurse  { nurse: {...} }
router.post('/:id/assign-nurse', verifyToken, (req, res) => {
  const updated = store.update(req.params.id, { assignedNurse: req.body?.nurse });
  if (!updated) return res.status(404).json({ error: 'Emergency not found' });
  res.json(updated);
});

// POST /api/emergencies/:id/dispatch-team  { team: {...} }
router.post('/:id/dispatch-team', verifyToken, (req, res) => {
  const updated = store.update(req.params.id, {
    emergencyTeam: { ...req.body?.team, status: 'En Route' },
    status: 'RESPONDING',
  });
  if (!updated) return res.status(404).json({ error: 'Emergency not found' });
  res.json(updated);
});

// POST /api/emergencies/:id/prepare-medicine  { medicineId }
router.post('/:id/prepare-medicine', verifyToken, (req, res) => {
  const emergency = store.get(req.params.id);
  if (!emergency) return res.status(404).json({ error: 'Emergency not found' });

  const requiredMedicines = (emergency.requiredMedicines || []).map((m) =>
    m.id === req.body?.medicineId ? { ...m, prepared: true } : m
  );
  const updated = store.update(req.params.id, { requiredMedicines });
  res.json(updated);
});

// POST /api/emergencies/:id/team-reached
router.post('/:id/team-reached', verifyToken, (req, res) => {
  const emergency = store.get(req.params.id);
  if (!emergency) return res.status(404).json({ error: 'Emergency not found' });
  const updated = store.update(req.params.id, {
    status: 'AT_SCENE',
    emergencyTeam: emergency.emergencyTeam
      ? { ...emergency.emergencyTeam, status: 'On Scene' }
      : emergency.emergencyTeam,
  });
  res.json(updated);
});

// POST /api/emergencies/:id/resolve  { outcomeNotes }
router.post('/:id/resolve', verifyToken, (req, res) => {
  const updated = store.update(req.params.id, {
    status: 'RESOLVED',
    resolvedAt: new Date().toISOString(),
    outcomeNotes: req.body?.outcomeNotes || '',
  });
  if (!updated) return res.status(404).json({ error: 'Emergency not found' });
  res.json(updated);
});

export default router;
export { store as emergenciesStore };
