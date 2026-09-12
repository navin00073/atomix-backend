import { createCrudRouter } from '../utils/crudRouter.js';

const { router, store } = createCrudRouter('iot_devices', { idPrefix: 'IOT' });

export default router;
export { store as iotStore };
