import { createCrudRouter } from '../utils/crudRouter.js';

const { router, store } = createCrudRouter('traceability', { idPrefix: 'TRC' });

export default router;
export { store as traceabilityStore };
