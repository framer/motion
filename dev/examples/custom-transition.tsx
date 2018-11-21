import * as React from 'react';
import { motion, usePose } from '@framer';
import { Box } from '../styled';
import useInterval from '../inc/use-interval';

const MotionBox = motion(Box)({
  ping: {
    x: 100,
    y: '0vh',
    opacity: 0,
    transition: { duration: 300 },
    transitionEnd: { display: 'none' }
  },
  pong: {
    x: -100,
    y: '20vh',
    opacity: 1,
    display: 'block',
    transition: { duration: 300 }
  }
});

export const App = () => {
  const [pose, setPose] = usePose('ping');

  useInterval(() => {
    setPose(pose.get() === 'ping' ? 'pong' : 'ping');
  }, 1000);

  return <MotionBox pose={pose} />;
};
