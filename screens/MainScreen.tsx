import {StyleSheet, View} from 'react-native';
import {useWallet} from '../components/provider/WalletProvider';
import InfoCard from '../components/InfoCard';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EDE7F6',
    width: '100%',
    height: '100%',
  },
});

const MainScreen = () => {
  const {wallet} = useWallet();

  return (
    <View style={styles.container}>
      <InfoCard
        label="Address"
        value={wallet?.publicKey.toString() ?? 'No wallet found'}
      />
    </View>
  );
};

export default MainScreen;
