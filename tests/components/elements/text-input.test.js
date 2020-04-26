/* eslint-disable jest/valid-expect */
import { h } from 'preact';
import TextInput from '../../../src/components/elements/text-input';
import render from 'preact-render-to-string';
import { shallow } from 'enzyme';

describe('Test input field', () => {
	test('Text input renders correctly', () => {
        const tree = render(<TextInput value="123" />);
        expect(tree).toMatchSnapshot();	
    });

    test('Text input sends onChange', () => {
        const onChangeMock = jest.fn();        
        const component = shallow(<TextInput value="123" onChange={onChangeMock} />);        
        component.find('input').simulate('change',"1");
        expect(onChangeMock).toHaveBeenCalled();
    });
});
