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
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {DEVNET_ENDPOINT} from './utils/dapp';
import {ConnectionProvider} from './components/provider/ConnectionProvider';

function App(): JSX.Element {
  return (
    <ConnectionProvider
      endpoint={DEVNET_ENDPOINT}
      config={{commitment: 'processed'}}>
      <WalletProvider>
        <SafeAreaProvider>
          <SafeAreaView>
            <View>
              <MainScreen />
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
