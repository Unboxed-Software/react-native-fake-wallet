/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import type {PropsWithChildren} from 'react';
import {Text, View} from 'react-native';
import {WalletProvider} from './components/provider/WalletProvider';
import MainScreen from './screens/MainScreen';
import 'react-native-get-random-values';

function App(): JSX.Element {
  useEffect(() => {
    console.log('in my fake wallet app component');
  }, []);
  return (
    <WalletProvider>
      <View>
        <MainScreen />
      </View>
    </WalletProvider>
  );
}

export default App;
