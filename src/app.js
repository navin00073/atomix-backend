import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import patientsRoutes from './routes/patients.routes.js';
import staffRoutes from './routes/staff.routes.js';
import medicinesRoutes from './routes/medicines.routes.js';
import vendingRoutes from './routes/vending.routes.js';
import robotsRoutes from './routes/robots.routes.js';
import iotRoutes from './routes/iot.routes.js';
import visitsRoutes from './routes/visits.routes.js';
import prescriptionsRoutes from './routes/prescriptions.routes.js';
import auditRoutes from './routes/audit.routes.js';
import alertsRoutes from './routes/alerts.routes.js';
import traceabilityRoutes from './routes/traceability.routes.js';
import emergenciesRoutes from './routes/emergencies.routes.js';
import cameraRoutes from './routes/camera.routes.js';

dotenv.config();

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || '*',
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'atomix-hospital-backend', time: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/patients', patientsRoutes);
  app.use('/api/staff', staffRoutes);
  app.use('/api/medicines', medicinesRoutes);
  app.use('/api/vending-machines', vendingRoutes);
  app.use('/api/robots', robotsRoutes);
  app.use('/api/iot-devices', iotRoutes);
  app.use('/api/visits', visitsRoutes);
  app.use('/api/prescriptions', prescriptionsRoutes);
  app.use('/api/audit-logs', auditRoutes);
  app.use('/api/alerts', alertsRoutes);
  app.use('/api/traceability', traceabilityRoutes);
  app.use('/api/emergencies', emergenciesRoutes);
  app.use('/api/camera-nodes', cameraRoutes);

  // 404 handler
  app.use('/api', (req, res) => {
    res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
  });

  // Central error handler
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  });

  return app;
}
