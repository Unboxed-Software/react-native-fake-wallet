import {Dimensions, StyleSheet} from 'react-native';

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
    height: 'auto',
    alignItems: 'center',
  },

  metadata: {
    display: 'flex',
    width: Dimensions.get('window').width,
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  content: {
    textAlign: 'left',
    color: 'green',
    fontSize: 18,
  },
});

export default styles;
