import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {useEffect} from 'react';

type InfoCardProps = {
  label: string;
  value: JSX.Element;
};

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    elevation: 16,
    backgroundColor: 'white',
    margin: 8,
    borderRadius: 8,
    padding: 6,
  },
  addressLabel: {
    backgroundColor: '#EDE7F6',
    borderRadius: 8,
    padding: 4,
    fontSize: 14,
    color: '#AA00FF',
    fontWeight: 'bold',
  },
});
const InfoCard = ({label, value}: InfoCardProps) => {
  return (
    <View style={styles.card}>
      <View style={{backgroundColor: '#EDE7F6', borderRadius: 8}}>
        <Text style={styles.addressLabel}>{label}</Text>
        {value}
      </View>
    </View>
  );
};

export default InfoCard;
