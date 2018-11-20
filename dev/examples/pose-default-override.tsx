import * as React from 'react';
import { motion } from '@framer';
import { Box } from '../styled';

const MotionBox = motion(Box)({
  default: { rotate: 0, backgroundColor: '#f00' },
  foo: { rotate: 45, backgroundColor: '#0f0' }
});

export const App = () => {
  return <MotionBox pose="foo" />;
};
