import { createContext } from 'react';

/**
 * @public
 */
var MotionConfigContext = createContext({
    transformPagePoint: function (p) { return p; },
    isStatic: false,
});

export { MotionConfigContext };
