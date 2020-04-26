/* eslint-disable jest/valid-expect */
import { h } from 'preact';
import TextInput from '../../../src/components/elements/text-input';
import render from 'preact-render-to-string';

describe('Test input field', () => {
	test('Text input renders correctly', () => {
        const tree = render(<TextInput value="123" />);
        expect(tree).toMatchSnapshot();	
    });
});
