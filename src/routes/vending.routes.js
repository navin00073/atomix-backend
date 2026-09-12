import { createCrudRouter } from '../utils/crudRouter.js';
import { verifyToken } from '../middleware/auth.js';

const { router, store } = createCrudRouter('vending_machines', { idPrefix: 'VM' });

// POST /api/vending-machines/:id/dispense  { slotNumber, quantity }
router.post('/:id/dispense', verifyToken, (req, res) => {
  const machine = store.get(req.params.id);
  if (!machine) return res.status(404).json({ error: 'Vending machine not found' });

  const { slotNumber, quantity = 1 } = req.body || {};
  const slots = (machine.slots || []).map((slot) => {
    if (slot.slotNumber !== slotNumber) return slot;
    const newStock = Math.max(0, slot.currentStock - quantity);
    return {
      ...slot,
      currentStock: newStock,
      motorStatus: 'RUNNING',
      sensorStatus: 'DISPENSED',
      health: newStock <= slot.minStock ? 'LOW_STOCK' : slot.health,
    };
  });

  const updated = store.update(req.params.id, {
    slots,
    status: 'Dispensing',
    lastDispenseTime: new Date().toISOString(),
  });
  res.json(updated);
});

export default router;
export { store as vendingStore };
