import {
  AuthorizeDappCompleteResponse,
  AuthorizeDappRequest,
  MWARequestFailReason,
  resolve,
} from '../../lib/mobile-wallet-adapter-walletlib/src';
import {useClientTrust} from '../provider/ClientTrustUseCaseProvider';
import {
  VerificationInProgress,
  VerificationState,
} from '../../utils/ClientTrustUseCase';
import {useState, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import MWABottomsheetHeader from './MWABottomsheetHeader';
import {Button} from 'react-native-paper';
import {useWallet} from '../provider/WalletProvider';

interface AuthorizeDappResuestProps {
  request: AuthorizeDappRequest;
}

const styles = StyleSheet.create({
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
  actionButton: {
    flex: 1,
    marginEnd: 8,
  },
});

const AuthorizeDappRequestScreen = ({request}: AuthorizeDappResuestProps) => {
  const {wallet} = useWallet();
  const {clientTrustUseCase} = useClientTrust();
  const [verificationState, setVerificationState] = useState<
    VerificationState | undefined
  >(undefined);

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
    <View>
      <MWABottomsheetHeader
        title="Authorize Dapp"
        cluster={request.cluster}
        appIdentity={request.appIdentity}
        verificationState={verificationState ?? new VerificationInProgress('')}
      />
      <View style={styles.buttonGroup}>
        <Button
          style={styles.actionButton}
          onPress={() => {
            resolve(request, {
              publicKey: wallet.publicKey.toBytes(),
              accountLabel: 'Backpack',
              authorizationScope: new TextEncoder().encode(
                verificationState?.authorizationScope,
              ),
            } as AuthorizeDappCompleteResponse);
          }}
          mode="contained">
          Authorize
        </Button>
        <Button
          style={styles.actionButton}
          onPress={() => {
            resolve(request, {failReason: MWARequestFailReason.UserDeclined});
          }}
          mode="outlined">
          Decline
        </Button>
      </View>
    </View>
  );
};

export default AuthorizeDappRequestScreen;
