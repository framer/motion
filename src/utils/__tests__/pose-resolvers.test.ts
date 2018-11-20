import { poseToArray } from '../pose-resolvers';

describe('poseToArray', () => {
  it('Should correctly convert single string to array', () => {
    expect(poseToArray('a')).toEqual(['a']);
  });

  it('Should leave arrays as-is', () => {
    expect(poseToArray(['a', 'b'])).toEqual(['a', 'b']);
  });

  it('Should remove falsey poses', () => {
    expect(poseToArray(undefined)).toEqual([]);
  });
});
