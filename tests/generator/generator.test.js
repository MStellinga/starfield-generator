/* eslint-disable jest/valid-expect */
import {generate, applyBlur, prepareGenerate} from '../../src/generator/generator';

describe('Test Generator UI', () => {
    
    // Note that these tests really don't do very much, but this is a pet project, not an enterprise application

    test('Test prepareGenerate', () => {
        prepareGenerate({},[{x: -1, y: -1, strength: 0, r: 255, g: 255, b:255,a:255, size1stars:2, size2stars:2, size3stars:50, bubbles:0, generated:0, fractalSize: 0 }],0,100,100);
    });

    test('Test base generate run', () => {
        prepareGenerate({},[{x: -1, y: -1, strength: 0, r: 255, g: 255, b:255,a:255, size1stars:2, size2stars:2, size3stars:50, bubbles:0, generated:0, fractalSize: 0 }],0,100,100);
        generate(0,0,10);
    });

    test('Test base blur run', () => {
        prepareGenerate({},[{x: -1, y: -1, strength: 0, r: 255, g: 255, b:255,a:255, size1stars:2, size2stars:2, size3stars:50, bubbles:0, generated:0, fractalSize: 0 }],0,100,100);
        generate(0,0,10);
        applyBlur(0);
    });

});
