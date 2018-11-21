import { useEffect } from 'react';

export default (
  callback: () => void,
  interval: number = 1000,
  args: any[] = []
) => {
  useEffect(() => {
    const int = setInterval(callback, interval);
    return () => clearInterval(int);
  }, args);
};
