import { createMotionProxy } from './motion-proxy.mjs';
import { createDomMotionConfig } from './utils/create-config.mjs';

/**
 * @public
 */
var m = createMotionProxy(createDomMotionConfig);

export { m };
