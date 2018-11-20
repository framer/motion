import * as React from 'react';
import { motion, usePose } from '@framer';
import { Box } from '../styled';
import useInterval from '../inc/use-interval';

const MotionBox = motion(Box)({
  ping: {
    x: 100,
    y: '0vh',
    transition: { duration: 23000 }
  },
  pong: { x: -100, y: '20vh' }
});

export const App = () => {
  const [pose, setPose] = usePose('ping');

  useInterval(() => {
    setPose(pose.get() === 'ping' ? 'pong' : 'ping');
  }, 1000);

  return <MotionBox pose={pose} />;
};
