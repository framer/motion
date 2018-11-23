import { render } from 'react-testing-library';
import motion from '../';
import * as React from 'react';

//import useMotionValue from '../../hooks/use-motion-value';
//
//import styled from 'styled-components';

// test('motion component renders', () => {
//   const Box = motion.div();
//   const { container } = render(<Box />);
//   expect(container.firstChild).toBeTruthy();
// });

// test('motion component renders custom component', () => {
//   const Box = motion.div();
//   const { getByTestId } = render(
//     <Box>
//       <div data-testid="child" />
//     </Box>
//   );
//   expect(getByTestId('child')).toBeTruthy();
// });

test('motion component accepts function ref', async () => {
  const Box = motion.div();

  const promise = new Promise(resolve => {
    const Component = () => <Box ref={resolve} />;
    const { rerender } = render(<Component />);
    rerender(<Component />);
  });

  await expect(promise).resolves.toBeTruthy();
});

// test('motion component accepts createRef', () => {
//   const Box = motion.div();

//   const { container } = render(<Box />);
//   expect(container.firstChild).toBeTruthy();
// });

// test('motion component generates style attr from pose', () => {
//   const Box = motion.div({
//     default: { backgroundColor: '#fff' }
//   });
//   const { container } = render(<Box />);
//   expect(container.firstChild).toHaveStyle('background-color: #fff');
// });

// test('motion component overwrites provided style attr with pose', () => {
//   const Box = motion.div({
//     default: { backgroundColor: '#fff' }
//   });
//   const { container } = render(
//     <Box style={{ backgroundColor: '#000', left: 500 }} />
//   );
//   expect(container.firstChild).toHaveStyle(
//     'background-color: #fff; left: 500px'
//   );
// });

// test('motion component renders styled component and overwrites style', () => {
//   const Box = styled.div`
//     background: #fff;
//   `;
//   const MotionBox = motion(Box)({
//     default: { background: '#000' }
//   });

//   const { container } = render(<MotionBox style={{ background: 'red' }} />);

//   expect(container.firstChild).toHaveStyle('background: #000');
// });

// test('motion component takes styles of defined initial pose', () => {
//   const Box = motion.div({
//     default: { x: 0 },
//     foo: { x: 100, transitionEnd: { display: 'none' } }
//   });
//   const { container } = render(<Box pose="foo" />);
//   expect(container.firstChild).toHaveStyle(
//     'transform: translateX(100px) translateZ(0); display: none;'
//   );
// });

// test("motion component doesn't forward pose prop", () => {
//   const Box = motion.div({ default: {} });
//   const { container } = render(<Box pose="default" />);
//   expect(container.firstChild).not.toHaveAttribute('pose');
// });

// test('motion component accepts motion value', () => {
//   const Box = motion.div();

//   const Component = () => {
//     const x = useMotionValue(800);
//     return <Box x={x} />;
//   };

//   const { container } = render(<Component />);
//   expect(container.firstChild).toHaveStyle(
//     'transform: translateX(800px) translateZ(0)'
//   );
// });

// test('motion component fires onPoseComplete', done => {
//   const Box = motion.div({
//     foo: { x: 100 },
//     bar: { x: 0, transition: false }
//   });

//   const { rerender } = render(<Box pose="foo" />);

//   rerender(
//     <Box
//       pose="bar"
//       onPoseComplete={current => {
//         // We would ideally like to inspect the DOM itself at this point
//         // but the node seems to be unmounted after sync ops have flushed
//         expect(current.x).toBe(0);
//         done();
//       }}
//     />
//   );
// });

// usePose

// useTransform
