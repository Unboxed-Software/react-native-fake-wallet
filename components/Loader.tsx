import {View} from 'react-native';
import {ActivityIndicator, Modal, Text} from 'react-native-paper';

const Loader = ({
  loadingText,
  indicatorColor,
}: {
  loadingText?: string;
  indicatorColor?: string;
}) => {
  return (
    <View>
      <Modal visible dismissable={false}>
        <ActivityIndicator
          size="large"
          animating
          color={indicatorColor ? indicatorColor : 'purple'}
        />
        <Text
          style={{
            color: 'white',
            textAlign: 'center',
            fontSize: 24,
            fontWeight: 'bold',
          }}>
          {loadingText}
        </Text>
      </Modal>
    </View>
  );
};

export default Loader;
