import { createContext, useContext } from "react";
export var MotionContext = createContext({});
export function useVisualElementContext() {
    return useContext(MotionContext).visualElement;
}
//# sourceMappingURL=index.js.map