import * as React from 'react';
import { rootProjectionNode } from './node/HTMLProjectionNode.mjs';

function useResetProjection() {
    var reset = React.useCallback(function () {
        var root = rootProjectionNode.current;
        if (!root)
            return;
        root.resetTree();
    }, []);
    return reset;
}

export { useResetProjection };
