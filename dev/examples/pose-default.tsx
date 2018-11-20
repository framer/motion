import * as React from 'react';
import { motion } from '@framer';
import { Box } from '../styled';

const MotionBox = motion(Box)({
  default: { scale: 2, backgroundColor: '#f00' }
});

export const App = () => {
  return <MotionBox />;
};
