import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

window.addEventListener = () => {};
window.removeEventListener = () => {};

AppRegistry.registerComponent(appName, () => App);
