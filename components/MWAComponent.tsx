import {useEffect} from 'react';
import {Text} from 'react-native';

const MWAComponent = () => {
  useEffect(() => {
    console.log('in my fake wallet MWA component');
  }, []);
  return <Text>Hello MWA</Text>;
};

export default MWAComponent;
