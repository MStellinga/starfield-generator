/* eslint-disable jest/valid-expect */
import { h } from 'preact';
import Checkbox from '../../../src/components/elements/checkbox';
import render from 'preact-render-to-string';

describe('Test Checkbox', () => {
	test('Checkbox renders input with a label', () => {
        const tree = render(<Checkbox label="Test" />);
        expect(tree).toMatchSnapshot();	
    });
    
    test('Checkbox renders checked input with a label', () => {
        const tree = render(<Checkbox value="true" label="Test" />);
        expect(tree).toMatchSnapshot();	
	});
});
