import { useEffect } from 'react';

function useUnmountEffect(callback) {
    return useEffect(function () { return function () { return callback(); }; }, []);
}

export { useUnmountEffect };
