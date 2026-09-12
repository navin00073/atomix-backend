import { createCrudRouter } from '../utils/crudRouter.js';

const { router, store } = createCrudRouter('audit_logs', { idPrefix: 'LOG' });

export default router;
export { store as auditStore };
