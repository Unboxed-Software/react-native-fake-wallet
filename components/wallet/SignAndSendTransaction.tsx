import {useEffect, useState} from 'react';
import {
  MWARequestFailReason,
  SignAndSendTransactionsRequest,
  resolve,
} from '../../lib/mobile-wallet-adapter-walletlib/src';
import {useClientTrust} from '../provider/ClientTrustUseCaseProvider';
import {useWallet} from '../provider/WalletProvider';
import {Dimensions, StyleSheet, View} from 'react-native';
import {Button, Divider, Text} from 'react-native-paper';
import {Keypair} from '@solana/web3.js';
import SignUseCase from '../../utils/SignUseCase';
import SendTranscationUseCase, {
  SendTransactionsError,
} from '../../utils/SendUseCase';

const styles = StyleSheet.create({
  icon: {height: 75, width: 75, marginTop: 16},
  header: {
    width: Dimensions.get('window').width,
    color: 'black',
    textAlign: 'center',
    fontSize: 24,
    marginVertical: 16,
  },
  info: {color: 'black', textAlign: 'left'},
  divider: {
    marginVertical: 8,
    width: Dimensions.get('window').width,
    height: 1,
  },
  root: {
    display: 'flex',
    width: Dimensions.get('window').width,
    alignItems: 'center',
  },
  button: {flex: 1, marginHorizontal: 8},
  buttonGroup: {
    width: Dimensions.get('window').width,
    display: 'flex',
    flexDirection: 'row',
    marginVertical: 16,
  },
  metadata: {
    display: 'flex',
    width: Dimensions.get('window').width,
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  content: {
    textAlign: 'left',
    color: 'green',
    fontSize: 18,
  },
});

const signAndSendTransaction = async (
  wallet: Keypair,
  request: SignAndSendTransactionsRequest,
) => {
  const valid = request.payloads.map(_ => true);
  let signedTsxs = request.payloads.map((payload, index) => {
    try {
      return SignUseCase.signTransaction(new Uint8Array(payload), wallet);
    } catch (e) {
      console.log('sign error: ' + e);
      valid[index] = false;
      return new Uint8Array([]);
    }
  });

  if (valid.includes(false)) {
    resolve(request, {
      failReason: MWARequestFailReason.InvalidSignatures,
      valid,
    });
    return;
  }

  try {
    const sigs = await SendTranscationUseCase.sendTransactions(
      signedTsxs,
      request.minContextSlot ? request.minContextSlot : undefined,
    );
    resolve(request, {signedTransactions: sigs});
  } catch (e) {
    console.log('Send error: ' + e);
    if (e instanceof SendTransactionsError) {
      resolve(request, {
        failReason: MWARequestFailReason.InvalidSignatures,
        valid: e.valid,
      });
    } else {
      throw e;
    }
  }
};

interface SignAndSendTransactionProps {
  request: SignAndSendTransactionsRequest;
}

const SignAndSendTransaction = ({request}: SignAndSendTransactionProps) => {
  const {wallet} = useWallet();
  const {clientTrustUseCase} = useClientTrust();
  const [verified, setVerified] = useState(false);

  if (!wallet) {
    throw new Error('Wallet is null or undefined');
  }

  useEffect(() => {
    const verifyClient = async () => {
      const authScope = new TextDecoder().decode(request.authorizationScope);
      const verified =
        (await clientTrustUseCase?.verifyPrivaledgedMethodSource(
          authScope,
          request.appIdentity?.identityUri,
        )) ?? false;

      setVerified(verified);

      if (!verified) {
        resolve(request, {
          failReason: MWARequestFailReason.UserDeclined,
        });
      }
    };

    verifyClient();
  }, []);

  return (
    <View style={styles.root}>
      <Text style={styles.header}>Sign and Send Transaction</Text>
      <Text style={styles.content}>
        This request has {request.payloads.length}{' '}
        {request.payloads.length > 1 ? 'payloads' : 'payload'} to sign.
      </Text>
      <Divider style={styles.divider} />
      <View style={styles.buttonGroup}>
        <Button
          style={styles.button}
          mode="contained"
          onPress={() => signAndSendTransaction(wallet, request)}>
          Sign and Send
        </Button>
        <Button
          style={styles.button}
          onPress={() => {
            resolve(request, {failReason: MWARequestFailReason.UserDeclined});
          }}
          mode="outlined">
          Reject
        </Button>
      </View>
    </View>
  );
};

export default SignAndSendTransaction;
