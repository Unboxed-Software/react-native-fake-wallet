/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {SafeAreaView, Text, View} from 'react-native';
import {WalletProvider} from './components/provider/WalletProvider';
import MainScreen from './screens/MainScreen';
import 'react-native-get-random-values';
import Loader from './components/Loader';
import {SafeAreaProvider} from 'react-native-safe-area-context';

function App(): JSX.Element {
  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <WalletProvider>
          <View>
            <MainScreen />
          </View>
        </WalletProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default App;
