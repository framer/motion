import createMotionComponent from './component';
import supportedElements from './supported-elements';
import { Motion } from './types';

const motion: Motion = createMotionComponent as Motion;

supportedElements.forEach(
  element => (motion[element] = createMotionComponent(element))
);

export default motion;
