import 'fast-text-encoding';
import {
  AuthorizeDappCompleteResponse,
  AuthorizeDappRequest,
  MWARequestFailReason,
  resolve,
} from '../../lib/mobile-wallet-adapter-walletlib/src';
import {useClientTrust} from '../provider/ClientTrustUseCaseProvider';
import {
  NotVerifiable,
  VerificationFailed,
  VerificationInProgress,
  VerificationState,
  VerificationSucceeded,
} from '../../utils/ClientTrustUseCase';
import {useState, useEffect} from 'react';
import {StyleSheet, View, Image, Text, Dimensions} from 'react-native';
import {Button, Divider} from 'react-native-paper';
import {useWallet} from '../provider/WalletProvider';

interface AuthorizeDappResuestProps {
  request: AuthorizeDappRequest;
}

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

  const verificationStatusText = function (): string {
    if (verificationState instanceof VerificationInProgress)
      return 'Verification In Progress';
    if (verificationState instanceof VerificationFailed)
      return 'Verification Failed';
    if (verificationState instanceof VerificationSucceeded)
      return 'Verification Succeeded';
    if (verificationState instanceof NotVerifiable) return 'Not Verifiable';
    else return 'Verification in progress';
  };

  useEffect(() => {
    const verifyClient = async () => {
      console.log('Dapp screen: ' + JSON.stringify(request.appIdentity));
      const verificationState =
        await clientTrustUseCase?.verifyAuthorizationSource(
          request.appIdentity?.identityUri,
        );
      console.log('Dapp screen: ' + JSON.stringify(verificationState));
      setVerificationState(verificationState);
    };

    verifyClient();
  }, []);

  return (
    <View style={styles.root}>
      {iconSource ? (
        <View>
          <Image source={iconSource} style={styles.icon} />
        </View>
      ) : null}
      <Text style={styles.header}>Authorize Dapp</Text>
      <Divider style={styles.divider} />
      <View style={styles.metadata}>
        <Text style={{...styles.info, fontSize: 20}}>Request Metadata</Text>
        <Text style={styles.info}>Cluster: {request.cluster}</Text>
        <Text style={styles.info}>
          App name: {request.appIdentity?.identityName}
        </Text>
        <Text style={styles.info}>
          App URI: {request.appIdentity?.identityUri}
        </Text>
        {verificationState && (
          <Text style={styles.info}>Status: {verificationStatusText()}</Text>
        )}
        {verificationState && (
          <Text style={styles.info}>
            Scope: {verificationState?.authorizationScope}
          </Text>
        )}
      </View>
      <Divider style={styles.divider} />
      <View style={styles.buttonGroup}>
        <Button
          style={styles.button}
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
          style={styles.button}
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
