import {useCallback, useEffect, useMemo, useState} from 'react';
import {Linking, SafeAreaView, StyleSheet, View} from 'react-native';
import {
  AuthorizeDappRequest,
  MWARequest,
  MWARequestFailReason,
  MWARequestType,
  MWASessionEvent,
  MWASessionEventType,
  MobileWalletAdapterConfig,
  ReauthorizeDappResponse,
  SignAndSendTransactionsRequest,
  getCallingPackage,
  resolve,
  useMobileWalletAdapterSession,
} from '../../lib/mobile-wallet-adapter-walletlib/src';
import {
  ClientTrustUseCase,
  NotVerifiable,
  VerificationFailed,
  VerificationSucceeded,
} from '../../utils/ClientTrustUseCase';
import {BackHandler} from 'react-native';
import {WalletProvider} from '../provider/WalletProvider';
import ClientTrustProvider from '../provider/ClientTrustUseCaseProvider';
import AuthorizeDappRequestScreen from './AuthorizeDappRequest';
import SignAndSendTransaction from './SignAndSendTransaction';
import {SafeAreaProvider} from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: {
    margin: 0,
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },
});

const getRequestScreenComponent = (request: MWARequest | null | undefined) => {
  switch (request?.__type) {
    case MWARequestType.AuthorizeDappRequest:
      return (
        <AuthorizeDappRequestScreen request={request as AuthorizeDappRequest} />
      );
    case MWARequestType.SignAndSendTransactionsRequest:
      return (
        <SignAndSendTransaction
          request={request as SignAndSendTransactionsRequest}
        />
      );
  }
};

const MWAComponent = () => {
  const [currentRequest, setCurrentRequest] = useState<MWARequest | null>(null);
  const [currentSession, setCurrentSession] = useState<MWASessionEvent | null>(
    null,
  );
  const [clientTrustUseCase, setClientTrustUseCase] =
    useState<ClientTrustUseCase | null>(null);

  useEffect(() => {
    const initClientTrustUseCase = async () => {
      const url = await Linking.getInitialURL();
      let callingPackage: string | undefined = await getCallingPackage();
      let clientTrustUseCase = new ClientTrustUseCase(
        url ?? '',
        callingPackage,
      );

      setClientTrustUseCase(clientTrustUseCase);
    };

    initClientTrustUseCase();
  }, []);

  useEffect(() => {
    if (currentSession?.__type == MWASessionEventType.SessionTerminatedEvent) {
      endWalletSession();
    }
  }, [currentSession]);

  const config: MobileWalletAdapterConfig = useMemo(() => {
    return {
      supportsSignAndSendTransactions: true,
      maxTransactionsPerSigningRequest: 10,
      maxMessagesPerSigningRequest: 10,
      supportedTransactionVersions: [0, 'legacy'],
      noConnectionWarningTimeoutMs: 3000,
    };
  }, []);

  const endWalletSession = useCallback(() => {
    setTimeout(() => {
      BackHandler.exitApp();
    }, 200);
  }, []);

  const handleRequest = useCallback((request: MWARequest) => {
    setCurrentRequest(request);
  }, []);

  const handleSessionEvent = useCallback((sessionEvent: MWASessionEvent) => {
    setCurrentSession(sessionEvent);
  }, []);

  useEffect(() => {
    if (!currentRequest) {
      return;
    }

    if (currentRequest.__type == MWARequestType.ReauthorizeDappRequest) {
      let request = currentRequest;
      const authorizationScope = new TextDecoder().decode(
        request.authorizationScope,
      );

      Promise.race([
        clientTrustUseCase!!.verifyReauthorizationSource(
          authorizationScope,
          request.appIdentity?.identityUri,
        ),
        async () => {
          setTimeout(() => {
            throw new Error(
              'Timed out waitingfor reauthorization source verification',
            );
          }, 3000);
        },
      ])
        .then(verificationState => {
          if (verificationState instanceof VerificationSucceeded) {
            console.log('Reauthorization source verification succeeded');
            resolve(request, {} as ReauthorizeDappResponse);
          } else if (verificationState instanceof NotVerifiable) {
            console.log('Reauthorization source not verifiable; approving');
            resolve(request, {} as ReauthorizeDappResponse);
          } else if (verificationState instanceof VerificationFailed) {
            console.log('Reauthorization source verification failed');
            resolve(request, {failReason: MWARequestFailReason.UserDeclined});
          }
        })
        .catch(() => {
          console.log(
            'Timed out waiting for reauthorization source verification',
          );
          resolve(request, {failReason: MWARequestFailReason.UserDeclined});
        });
    }
  }, [currentRequest, endWalletSession]);

  useMobileWalletAdapterSession(
    'React Native Fake Wallet',
    config,
    handleRequest,
    handleSessionEvent,
  );
  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <WalletProvider>
          <ClientTrustProvider clientTrustUseCase={clientTrustUseCase}>
            <View style={styles.container}>
              {getRequestScreenComponent(currentRequest)}
            </View>
          </ClientTrustProvider>
        </WalletProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default MWAComponent;
