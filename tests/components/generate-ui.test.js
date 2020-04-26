/* eslint-disable jest/valid-expect */
import { h } from 'preact';
import render from 'preact-render-to-string';
import GeneratorUI from '../../src/components/generator-ui';

describe('Test Generator UI', () => {
	test('Generator UI renders', () => {
        const tree = render(<GeneratorUI />);
        expect(tree).toMatchSnapshot();	
    });

    // Unfortunately, adding tests that call event handlers is hard to do with Enzyme and function-based Preact components (at this time, anyway)
});
