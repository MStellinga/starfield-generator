/* eslint-disable jest/valid-expect */
import { h } from 'preact';
import render from 'preact-render-to-string';
import GenerateSettings from '../../../src/components/settings/generate-settings';

const mockSettings =  {    
    nebulaBubbleBaseSize:30,
    nebulaBubbleMaxSize: 160,
    nebulaBubbleCenterBaseSize: 30,
    nebulaBubbleCenterMaxSize: 80,
    colorDistanceFalloff: 2.0,
    colorDampening: 4.0,
    fractalDivisionCount: 6,
    fractalMinSize: 5,
    fractalColorGain: 10,
    blueStars: false,
    blurNebula: false,
    blurFractal: false      
  }

describe('Test Generate settings', () => {
	test('Generate settings renders', () => {
        const tree = render(<GenerateSettings settings={{}} />);
        expect(tree).toMatchSnapshot();	
    });

    test('Generate settings renders with actual settings', () => {
        const tree = render(<GenerateSettings settings={mockSettings} />);
        expect(tree).toMatchSnapshot();	
    });   

    // Unfortunately, adding tests that call event handlers is hard to do with Enzyme and function-based Preact components (at this time, anyway)
});
