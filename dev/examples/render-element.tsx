import * as React from 'react';
import { motion } from '@framer';

const MotionBox = motion.ul();

export const App = () => {
  return (
    <MotionBox
      style={{ width: 100, height: 100, background: 'green', padding: 0 }}
    />
  );
};
