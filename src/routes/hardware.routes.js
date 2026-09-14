import { Router } from 'express';
import { staffStore } from './staff.routes.js';
import { auditStore } from './audit.routes.js';

const router = Router();

// Simple API key for hardware devices (set HARDWARE_API_KEY in backend .env / Render env vars)
const HARDWARE_API_KEY = process.env.HARDWARE_API_KEY || 'atomix-hardware-2026';

function checkApiKey(req, res, next) {
  const key = req.headers['x-api-key'] || req.body?.apiKey;
  if (key !== HARDWARE_API_KEY) {
    return res.status(401).json({ error: 'Invalid hardware API key' });
  }
  next();
}

// POST /api/hardware/fingerprint-checkin
// Body: { staffId: "STF-xxxx", apiKey: "..." }
// Called directly by the ESP32 after a successful fingerprint match.
router.post('/fingerprint-checkin', checkApiKey, (req, res) => {
  const { staffId } = req.body || {};
  if (!staffId) return res.status(400).json({ error: 'staffId is required' });

  const updated = staffStore.update(staffId, {
    status: 'Present',
    checkInTime: new Date().toISOString(),
  });

  if (!updated) return res.status(404).json({ error: 'Staff member not found' });

  auditStore.create({
    actor: 'ESP32 Fingerprint Terminal',
    role: 'HARDWARE',
    action: 'Fingerprint Check-In',
    details: `${updated.name} checked in via fingerprint scan (ESP32-BIO-01).`,
    category: 'IDENTIFICATION',
    severity: 'INFO',
  }, 'LOG');

  res.json({ success: true, staff: updated });
});

// GET /api/hardware/ping - simple connectivity test for the ESP32
router.get('/ping', checkApiKey, (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

export default router;
