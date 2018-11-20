import * as React from 'react';
import { motion } from '@framer';
import { Box } from '../styled';
import useInterval from '../inc/use-interval';

const MotionBox = motion(Box)({
  a: { scale: 2 },
  b: { scale: 0.5 },
  c: { background: '#00f' }
});

export const App = () => {
  const [pose, setPose] = React.useState('a');

  useInterval(
    () => {
      setPose(pose === 'a' ? 'b' : 'a');
    },
    1000,
    [pose]
  );

  return <MotionBox pose={[pose, 'c']} />;
};
