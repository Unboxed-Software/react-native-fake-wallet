import {StyleSheet, View} from 'react-native';
import {useWallet} from '../components/provider/WalletProvider';
import InfoCard from '../components/InfoCard';
import {useState, useEffect, useCallback} from 'react';
import {useConnection} from '../components/provider/ConnectionProvider';
import {Button, Text} from 'react-native-paper';
import {AIRDROP_LAMPORTS, convertLamportsToBalance} from '../utils/dapp';
import globalStyles from '../utils/Styles';
import {showToastOrAlert} from '../utils/common';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EDE7F6',
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  airdropButton: {
    maxWidth: '60%',
    marginVertical: 12,
  },
});

const MainScreen = () => {
  const {wallet} = useWallet();
  const {connection} = useConnection();
  const [balance, setBalance] = useState<string>('Loading balance...');
  const [airdropLoading, setAirdropLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const requestAirdrop = useCallback(async () => {
    if (wallet) {
      try {
        const signature = await connection.requestAirdrop(
          wallet?.publicKey,
          AIRDROP_LAMPORTS,
        );

        const latestBlockhash = await connection.getLatestBlockhash();
        await connection.confirmTransaction({
          signature: signature,
          lastValidBlockHeight: latestBlockhash?.lastValidBlockHeight,
          blockhash: latestBlockhash?.blockhash,
        });
        setAirdropLoading(false);
      } catch (e: any) {
        if (e.toString().includes('429')) {
          showToastOrAlert(
            'Too many airdrop requests. Please try again after 24 hours.',
            'Too many requests',
          );
        } else {
          showToastOrAlert('Something went wrong', 'Error');
        }
        setAirdropLoading(false);
      }
    }
  }, [wallet, connection]);

  const getBalance = async () => {
    if (wallet && !airdropLoading) {
      setBalance('Loading balance...');
      const balance = await connection.getBalance(wallet?.publicKey, {
        commitment: 'processed',
      });
      setBalance(`${convertLamportsToBalance(balance)} SOL`);
    }
  };

  useEffect(() => {
    getBalance();
  }, [wallet, airdropLoading]);
  return (
    <View style={styles.container}>
      <InfoCard
        label="Address"
        value={
          <View style={globalStyles.infoValue}>
            <Button>Reset Keypair</Button>
            <Text>
              {wallet ? wallet.publicKey.toString() : 'No wallet found'}
            </Text>
          </View>
        }
      />

      <InfoCard
        label="Balance"
        value={<Text style={globalStyles.infoValue}>{balance}</Text>}
      />

      <Button
        mode="elevated"
        style={styles.airdropButton}
        onPress={() => {
          setAirdropLoading(true);
          requestAirdrop();
        }}
        disabled={airdropLoading}>
        {airdropLoading ? 'Requesting Airdrop...' : 'Request Airdrop'}
      </Button>
    </View>
  );
};

export default MainScreen;
