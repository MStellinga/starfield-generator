/* eslint-disable jest/valid-expect */
import { h } from 'preact';
import Progress from '../../../src/components/elements/progress';
import render from 'preact-render-to-string';

describe('Test progress', () => {
	test('Progress renders correctly', () => {
        const tree = render(<Progress progress="50" />);
        expect(tree).toMatchSnapshot();
	});
});
