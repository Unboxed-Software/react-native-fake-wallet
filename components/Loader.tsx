import {Dimensions, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Modal, Text} from 'react-native-paper';

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
  },
});

const Loader = ({indicatorColor}: {indicatorColor?: string}) => {
  return (
    <View style={styles.overlay}>
      <Modal visible dismissable={false}>
        <ActivityIndicator
          size="large"
          animating
          color={indicatorColor ? indicatorColor : 'purple'}
        />
      </Modal>
    </View>
  );
};

export default Loader;
