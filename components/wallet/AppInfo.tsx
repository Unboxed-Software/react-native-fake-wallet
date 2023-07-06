import {Dimensions, Image, StyleSheet, View} from 'react-native';
import {Divider, Text} from 'react-native-paper';

interface AppInfoProps {
  iconSource?: any;
  title?: string;
  cluster?: string;
  appName?: string;
  uri?: string;
  verificationText?: string;
  scope?: string;
  needDivider?: boolean;
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
  metadata: {
    display: 'flex',
    width: Dimensions.get('window').width,
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
});

const AppInfo = ({
  iconSource,
  title,
  cluster,
  appName,
  uri,
  verificationText,
  scope,
  needDivider = false,
}: AppInfoProps) => {
  return (
    <>
      {iconSource ? (
        <View>
          <Image source={iconSource} style={styles.icon} />
        </View>
      ) : null}
      <Text style={styles.header}>{title}</Text>
      <Divider style={styles.divider} />
      <View style={styles.metadata}>
        <Text style={{...styles.info, fontSize: 20}}>Request Metadata</Text>
        <Text style={styles.info}>Cluster: {cluster}</Text>
        <Text style={styles.info}>App name: {appName}</Text>
        <Text style={styles.info}>App URI: {uri}</Text>
        <Text style={styles.info}>Status: {verificationText}</Text>
        <Text style={styles.info}>Scope: {scope}</Text>
      </View>
      {needDivider && <Divider style={styles.divider} />}
    </>
  );
};

export default AppInfo;
