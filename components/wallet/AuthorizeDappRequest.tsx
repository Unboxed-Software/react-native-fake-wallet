import 'fast-text-encoding';
import {
  AuthorizeDappCompleteResponse,
  AuthorizeDappRequest,
  MWARequestFailReason,
  resolve,
} from '../../lib/mobile-wallet-adapter-walletlib/src';
import {useClientTrust} from '../provider/ClientTrustUseCaseProvider';
import {
  VerificationState,
  verificationStatusText,
} from '../../utils/ClientTrustUseCase';
import {useState, useEffect} from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import {useWallet} from '../provider/WalletProvider';
import Loader from '../Loader';
import AppInfo from './AppInfo';
import {getIconFromIdentityUri} from '../../utils/dapp';
import ButtonGroup from './ButtonGroup';

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
        iconSource={getIconFromIdentityUri(request.appIdentity)}
        title="Authorize Dapp"
        appName={request.appIdentity?.identityName}
        uri={request.appIdentity?.identityUri}
        cluster={request.cluster}
        verificationText={verificationStatusText(verificationState)}
        scope={verificationState?.authorizationScope}
        needDivider
      />

      <ButtonGroup
        positiveButtonText="Authorize"
        negativeButtonText="Decline"
        positiveOnClick={() => {
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
        negativeOnClick={() => {
          setLoading(true);
          resolve(request, {
            failReason: MWARequestFailReason.UserDeclined,
          });
          setLoading(false);
        }}
      />
    </View>
  );
};

export default AuthorizeDappRequestScreen;
