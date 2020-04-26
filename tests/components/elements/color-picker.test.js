/* eslint-disable jest/valid-expect */
import { h } from 'preact';
import render from 'preact-render-to-string';
import ColorPicker from '../../../src/components/elements/color-picker';

describe('Test color picker', () => {

	test('Color picker renders correctly', () => {
        const tree = render(<ColorPicker color={{r:1,g:2,b:3}} />);
        expect(tree).toMatchSnapshot();	
    });
    
});
