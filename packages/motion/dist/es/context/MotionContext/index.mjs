import { createContext, useContext } from 'react';

var MotionContext = createContext({});
function useVisualElementContext() {
    return useContext(MotionContext).visualElement;
}

export { MotionContext, useVisualElementContext };
