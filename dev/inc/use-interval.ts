import { useEffect } from 'react';

export default (callback: () => void, interval: number = 1000, args = []) => {
  useEffect(() => {
    const int = setInterval(callback, interval);
    return () => clearInterval(int);
  }, args);
};
