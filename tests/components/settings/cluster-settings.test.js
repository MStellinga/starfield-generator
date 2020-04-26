/* eslint-disable jest/valid-expect */
import { h } from 'preact';
import ClusterSettings from '../../../src/components/settings/cluster-settings';
import render from 'preact-render-to-string';

describe('Test Cluster settings', () => {
	test('Cluster settings renders', () => {
        const tree = render(<ClusterSettings clusters={[]} />);
        expect(tree).toMatchSnapshot();	
    });

    test('Cluster settings with some clusters renders', () => {
        const tree = render(<ClusterSettings clusters={[
            {x: 1, y: 5, strength: 300, r: 0, g: 0, b:250,a:255, size1stars:42, size2stars:50, size3stars:10, bubbles:500, generated:0, fractalSize: 0 },
            {x: 3, y: 28, strength: 300, r: 180, g: 0, b:180,a:255, size1stars:0, size2stars:0, size3stars:0, bubbles:0, generated:0, fractalSize: 100 }
        ]} />);
        expect(tree).toMatchSnapshot();	
    });    

    // Unfortunately, adding tests that call event handlers is hard to do with Enzyme and function-based Preact components (at this time, anyway)
});
