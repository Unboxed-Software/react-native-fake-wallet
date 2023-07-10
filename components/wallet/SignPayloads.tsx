import {Dimensions, StyleSheet, View} from 'react-native';
import {
  MWARequestFailReason,
  MWARequestType,
  SignMessagesRequest,
  SignTransactionsRequest,
  resolve,
} from '../../lib/mobile-wallet-adapter-walletlib/src';
import {
  ClientTrustUseCase,
  VerificationState,
  verificationStatusText,
} from '../../utils/ClientTrustUseCase';
import {useClientTrust} from '../provider/ClientTrustUseCaseProvider';
import {useWallet} from '../provider/WalletProvider';
import {useState, useEffect} from 'react';
import AppInfo from './AppInfo';
import {getIconFromIdentityUri, getSignedPayloads} from '../../utils/dapp';
import {Divider, Text} from 'react-native-paper';
import ButtonGroup from './ButtonGroup';
import {Keypair} from '@solana/web3.js';
import styles from '../../utils/Styles';
import Loader from '../Loader';

const signTransactions = (
  wallet: Keypair,
  request: SignTransactionsRequest,
  onFinish: () => void,
) => {
  const [valid, signedPayloads] = getSignedPayloads(
    request.__type,
    wallet,
    request.payloads,
  );

  if (valid.includes(false)) {
    resolve(request, {
      failReason: MWARequestFailReason.InvalidSignatures,
      valid,
    });
  } else {
    resolve(request, {signedPayloads});
  }
  onFinish();
};

const signMessages = (
  wallet: Keypair,
  request: SignMessagesRequest,
  onFinish: () => void,
) => {
  const [valid, signedPayloads] = getSignedPayloads(
    request.__type,
    wallet,
    request.payloads,
  );

  if (valid.includes(false)) {
    resolve(request, {
      failReason: MWARequestFailReason.InvalidSignatures,
      valid,
    });
  } else {
    resolve(request, {signedPayloads});
  }
  onFinish();
};

const signPayloads = (
  wallet: Keypair,
  request: SignTransactionsRequest | SignMessagesRequest,
  onFinish: () => void,
) => {
  if (request.__type == MWARequestType.SignMessagesRequest) {
    signMessages(wallet, request, onFinish);
  } else if (request.__type == MWARequestType.SignTransactionsRequest) {
    signTransactions(wallet, request, onFinish);
  } else {
    console.log('Invalid payload sign request type');
    return;
  }
};

interface SignPayloadProps {
  request: SignTransactionsRequest | SignMessagesRequest;
}

const SignPayloads = ({request}: SignPayloadProps) => {
  const {wallet} = useWallet();
  const {clientTrustUseCase} = useClientTrust();
  const [verificationState, setVerificationState] = useState<
    VerificationState | undefined
  >(undefined);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const isSignTransactions =
    request.__type == MWARequestType.SignTransactionsRequest;

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

      //soft decline, not great UX. Should tell the user that the client was not verified
      if (!verified) {
        if (request.__type == MWARequestType.SignTransactionsRequest) {
          resolve(request, {failReason: MWARequestFailReason.UserDeclined});
        } else if (request.__type == MWARequestType.SignMessagesRequest) {
          resolve(request, {failReason: MWARequestFailReason.UserDeclined});
        }
      }
      setVerified(verified);
    };

    verifyClient();
  }, []);

  return (
    <View style={styles.root}>
      <AppInfo
        iconSource={getIconFromIdentityUri(request.appIdentity)}
        title="Sign Message(s)"
        appName={request.appIdentity?.identityName}
        uri={request.appIdentity?.identityUri}
        cluster={request.cluster}
        scope={verificationState?.authorizationScope}
        verificationText={verificationStatusText(verificationState)}
        needDivider
      />
      <Text style={styles.header}>Payloads</Text>
      <Text style={styles.content}>
        This request has {request.payloads.length}{' '}
        {request.payloads.length > 1 ? 'payloads' : 'payload'} to sign.
      </Text>
      <Divider style={styles.divider} />
      <ButtonGroup
        positiveButtonText="Sign Message"
        negativeButtonText="Reject"
        positiveOnClick={() => {
          setLoading(true);
          signPayloads(wallet as Keypair, request, () => {
            setLoading(false);
          });
        }}
        negativeOnClick={() => {
          if (request.__type == MWARequestType.SignMessagesRequest) {
            resolve(request as SignMessagesRequest, {
              failReason: MWARequestFailReason.UserDeclined,
            });
          } else {
            resolve(request as SignTransactionsRequest, {
              failReason: MWARequestFailReason.UserDeclined,
            });
          }
        }}
      />
      {loading && <Loader />}
    </View>
  );
};

export default SignPayloads;
