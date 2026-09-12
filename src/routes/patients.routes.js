import { createCrudRouter } from '../utils/crudRouter.js';

const { router, store } = createCrudRouter('patients', { idPrefix: 'PT' });

// GET /api/patients/:id/visits could be added by joining with visits store if needed.

export default router;
export { store as patientsStore };
