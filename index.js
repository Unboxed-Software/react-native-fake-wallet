import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import MWAComponent from './components/MWAComponent';

window.addEventListener = () => {};
window.removeEventListener = () => {};

AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerComponent(
  'MobileWalletAdapterEntrypoint',
  () => MWAComponent,
);
