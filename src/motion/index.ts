import createMotionComponent from './component';
import supportedElements from './supported-elements';

const motion = createMotionComponent;

supportedElements.forEach(
  element => (motion[element] = createMotionComponent(element))
);

export default motion;
