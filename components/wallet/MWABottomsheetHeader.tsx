import React from 'react';
import {StyleSheet, View, Image} from 'react-native';
import {Divider, Text} from 'react-native-paper';
import {
  VerificationFailed,
  VerificationInProgress,
  VerificationState,
  VerificationSucceeded,
} from '../../utils/ClientTrustUseCase';

interface MWABottomsheetHeaderProps {
  title: String;
  cluster: String;
  appIdentity: AppIdentity;
  verificationState?: VerificationState | undefined;
  children?: React.ReactNode;
}

type AppIdentity =
  | Readonly<{
      identityUri?: string;
      iconRelativeUri?: string;
      identityName?: string;
    }>
  | undefined
  | null;

export default function MWABottomsheetHeader({
  title,
  cluster,
  appIdentity,
  verificationState,
  children,
}: MWABottomsheetHeaderProps) {
  const iconSource =
    appIdentity?.iconRelativeUri &&
    appIdentity.identityUri &&
    appIdentity.iconRelativeUri != 'null' &&
    appIdentity.identityUri != 'null'
      ? {
          uri: new URL(
            appIdentity.iconRelativeUri,
            appIdentity.identityUri,
          ).toString(),
        }
      : require('../../img/unknownapp.jpg');

  let statusText = <Text>Status: Verification in progress </Text>;
  if (verificationState instanceof VerificationSucceeded) {
    statusText = <Text>Status: Verification Succeeded </Text>;
  } else if (verificationState instanceof VerificationFailed) {
    statusText = <Text>Status: Verification Failed </Text>;
  }

  const verificationStatusText = function (): string {
    if (verificationState instanceof VerificationFailed)
      return 'Verification Failed';
    if (verificationState instanceof VerificationSucceeded)
      return 'Verification Succeeded';
    else return 'Verification in progress';
  };

  return (
    <View>
      {iconSource ? (
        <View style={styles.headerImage}>
          <Image source={iconSource} style={styles.icon} />
        </View>
      ) : null}
      <Text>{title}</Text>
      <Divider />
      <View>
        <Text>Request Metadata</Text>
        <Text>Cluster: {cluster}</Text>
        <Text>App name: {appIdentity?.identityName}</Text>
        <Text>App URI: {appIdentity?.identityUri}</Text>
        {verificationState && <Text>Status: {verificationStatusText()}</Text>}
        {verificationState && (
          <Text>Scope: {verificationState?.authorizationScope}</Text>
        )}
      </View>
      <View>{children}</View>
      <Divider />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 75,
    height: 75,
  },
  header: {
    textAlign: 'center',
    color: 'black',
    fontSize: 32,
  },
  headerImage: {
    alignSelf: 'center',
    paddingBottom: 8,
  },
  metadataSection: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 8, // rounded corners
    padding: 10, // tight padding
    marginVertical: 10, // some vertical margin
  },
  metadataText: {
    textAlign: 'left',
    color: 'black',
    fontSize: 16,
  },
  metadataHeader: {
    textAlign: 'left',
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
  },
  spacer: {
    marginVertical: 16,
    width: '100%',
    height: 1,
  },
});
