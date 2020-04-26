/* eslint-disable jest/valid-expect */
import { h } from 'preact';
import render from 'preact-render-to-string';
import Picture from '../../../src/components/settings/picture';

describe('Test Image settings', () => {
	test('Image settings renders', () => {
        const tree = render(<Picture width={1} height={2} cluster={[]} />);
        expect(tree).toMatchSnapshot();	
    });

    // Unfortunately, adding tests that call event handlers is hard to do with Enzyme and function-based Preact components (at this time, anyway)
});
