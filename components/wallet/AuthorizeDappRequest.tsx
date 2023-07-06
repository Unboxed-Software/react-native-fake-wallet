import 'fast-text-encoding';
import {
  AuthorizeDappCompleteResponse,
  AuthorizeDappRequest,
  MWARequestFailReason,
  MWARequestType,
  SignAndSendTransactionsRequest,
  resolve,
} from '../../lib/mobile-wallet-adapter-walletlib/src';
import {useClientTrust} from '../provider/ClientTrustUseCaseProvider';
import {
  NotVerifiable,
  VerificationFailed,
  VerificationInProgress,
  VerificationState,
  VerificationSucceeded,
  verificationStatusText,
} from '../../utils/ClientTrustUseCase';
import {useState, useEffect} from 'react';
import {StyleSheet, View, Image, Text, Dimensions} from 'react-native';
import {Button} from 'react-native-paper';
import {useWallet} from '../provider/WalletProvider';
import Loader from '../Loader';
import AppInfo from './AppInfo';
import SignAndSendTransaction from './SignAndSendTransaction';

interface AuthorizeDappResuestProps {
  request: AuthorizeDappRequest;
}

const styles = StyleSheet.create({
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
});

const AuthorizeDappRequestScreen = ({request}: AuthorizeDappResuestProps) => {
  const {wallet} = useWallet();
  const {clientTrustUseCase} = useClientTrust();
  const [verificationState, setVerificationState] = useState<
    VerificationState | undefined
  >(undefined);

  const [loading, setLoading] = useState(false);

  if (!wallet) {
    throw new Error('No wallet found');
  }

  const iconSource =
    request.appIdentity?.iconRelativeUri &&
    request.appIdentity.identityUri &&
    request.appIdentity.iconRelativeUri != 'null' &&
    request.appIdentity.identityUri != 'null'
      ? {
          uri: new URL(
            request.appIdentity.iconRelativeUri,
            request.appIdentity.identityUri,
          ).toString(),
        }
      : require('../../img/unknownapp.jpg');

  useEffect(() => {
    const verifyClient = async () => {
      const verificationState =
        await clientTrustUseCase?.verifyAuthorizationSource(
          request.appIdentity?.identityUri,
        );
      setVerificationState(verificationState);
    };

    verifyClient();
  }, []);

  return (
    <View style={styles.root}>
      {loading && <Loader loadingText="Authorization in progress..." />}
      <AppInfo
        iconSource={iconSource}
        title="Authorize Dapp"
        appName={request.appIdentity?.identityName}
        uri={request.appIdentity?.identityUri}
        cluster={request.cluster}
        verificationText={verificationStatusText(verificationState)}
        scope={verificationState?.authorizationScope}
        needDivider
      />

      <View style={styles.buttonGroup}>
        <Button
          style={styles.button}
          onPress={() => {
            setLoading(true);
            resolve(request, {
              publicKey: wallet.publicKey.toBytes(),
              accountLabel: 'Backpack',
              authorizationScope: new TextEncoder().encode(
                verificationState?.authorizationScope,
              ),
            } as AuthorizeDappCompleteResponse);
            setLoading(false);
          }}
          mode="contained">
          Authorize
        </Button>
        <Button
          style={styles.button}
          onPress={() => {
            setLoading(true);
            resolve(request, {failReason: MWARequestFailReason.UserDeclined});
            setLoading(false);
          }}
          mode="outlined">
          Decline
        </Button>
      </View>
    </View>
  );
};

export default AuthorizeDappRequestScreen;
