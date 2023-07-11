import {Alert, Platform, ToastAndroid} from 'react-native';

export const showToastOrAlert = (message: string, title?: string) => {
  if (Platform.OS == 'android') {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else if (Platform.OS == 'ios') {
    Alert.alert(title ?? 'Alert', message, undefined, {cancelable: true});
  }
};
