import { h, Component } from 'preact';
import GeneratorUI from './generator-ui';

// eslint-disable-next-line react/prefer-stateless-function
export default class App extends Component {

	render() {
		return (
			<div id="app">
				<GeneratorUI />
			</div>
		);
	}
}
