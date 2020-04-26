/* eslint-disable jest/valid-expect */
import { h } from 'preact';
import render from 'preact-render-to-string';
import ImageSettings from '../../../src/components/settings/image-settings';

describe('Test Image settings', () => {
	test('Image settings renders', () => {
        const tree = render(<ImageSettings width={1} height={2} />);
        expect(tree).toMatchSnapshot();	
    });

    // Unfortunately, adding tests that call event handlers is hard to do with Enzyme and function-based Preact components (at this time, anyway)
});
