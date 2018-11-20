import * as React from 'react';
import { motion } from '@framer';
import { Box } from '../styled';

const MotionBox = motion(Box)();

export const App = () => {
  return <MotionBox />;
};
