import {Dimensions, StyleSheet, View} from 'react-native';
import {Button} from 'react-native-paper';

const styles = StyleSheet.create({
  button: {flex: 1, marginHorizontal: 8},
  buttonGroup: {
    width: Dimensions.get('window').width,
    display: 'flex',
    flexDirection: 'row',
    marginVertical: 16,
  },
});

interface ButtonGroupProps {
  positiveOnClick: () => any;
  negativeOnClick: () => any;
  positiveButtonText: string;
  negativeButtonText: string;
}
const ButtonGroup = (props: ButtonGroupProps) => {
  return (
    <View style={styles.buttonGroup}>
      <Button
        style={styles.button}
        mode="contained"
        onPress={() => props.positiveOnClick()}>
        {props.positiveButtonText}
      </Button>
      <Button
        style={styles.button}
        onPress={() => props.negativeOnClick()}
        mode="outlined">
        {props.negativeButtonText}
      </Button>
    </View>
  );
};

export default ButtonGroup;
