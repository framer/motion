import { useEffect } from "react";
export function useUnmountEffect(callback) {
    return useEffect(function () { return function () { return callback(); }; }, []);
}
//# sourceMappingURL=use-unmount-effect.js.map