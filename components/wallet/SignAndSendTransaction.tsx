import {useState, useEffect} from 'react';
import {
  MWARequestFailReason,
  SignAndSendTransactionsRequest,
  resolve,
} from '../../lib/mobile-wallet-adapter-walletlib/src';
import {useClientTrust} from '../provider/ClientTrustUseCaseProvider';
import {useWallet} from '../provider/WalletProvider';
import {Dimensions, StyleSheet, View} from 'react-native';
import {Divider, Text} from 'react-native-paper';
import {Keypair} from '@solana/web3.js';
import SignUseCase from '../../utils/SignUseCase';
import SendTranscationUseCase, {
  SendTransactionsError,
} from '../../utils/SendUseCase';
import AppInfo from './AppInfo';
import Loader from '../Loader';
import {
  VerificationState,
  verificationStatusText,
} from '../../utils/ClientTrustUseCase';
import {getIconFromIdentityUri, getSignedPayloads} from '../../utils/dapp';
import ButtonGroup from './ButtonGroup';
import styles from '../../utils/Styles';

const signAndSendTransaction = async (
  wallet: Keypair,
  request: SignAndSendTransactionsRequest,
  onFinish: () => void,
) => {
  const [valid, signedTsxs] = getSignedPayloads(
    request.__type,
    wallet,
    request.payloads,
  );

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
    onFinish();
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
  const [loading, setLoading] = useState(false);
  const [verificationState, setVerificationState] = useState<
    VerificationState | undefined
  >(undefined);

  if (!wallet) {
    throw new Error('Wallet is null or undefined');
  }

  useEffect(() => {
    const verifyClient = async () => {
      const authScope = new TextDecoder().decode(request.authorizationScope);
      const verificationState =
        await clientTrustUseCase?.verifyAuthorizationSource(
          request.appIdentity?.identityUri,
        );
      setVerificationState(verificationState);

      const verified =
        (await clientTrustUseCase?.verifyPrivaledgedMethodSource(
          authScope,
          request.appIdentity?.identityUri,
        )) ?? false;
      setVerified(verified);

      //soft decline, not great UX. Should tell the user that client was not verified
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
      <AppInfo
        iconSource={getIconFromIdentityUri(request.appIdentity)}
        title="Sign and Send Transaction"
        appName={request.appIdentity?.identityName}
        uri={request.appIdentity?.identityUri}
        cluster={request.cluster}
        verificationText={verificationStatusText(verificationState)}
        scope={verificationState?.authorizationScope}
        needDivider
      />
      <Text style={styles.header}>Payloads</Text>
      <Text style={styles.content}>
        This request has {request.payloads.length}{' '}
        {request.payloads.length > 1 ? 'payloads' : 'payload'} to sign.
      </Text>
      <Divider style={styles.divider} />
      <ButtonGroup
        positiveButtonText="Sign and Send"
        negativeButtonText="Reject"
        positiveOnClick={() => {
          setLoading(true);
          signAndSendTransaction(wallet as Keypair, request, () => {
            setLoading(false);
          });
        }}
        negativeOnClick={() => {
          resolve(request, {failReason: MWARequestFailReason.UserDeclined});
        }}
      />
      {loading && <Loader />}
    </View>
  );
};

export default SignAndSendTransaction;
