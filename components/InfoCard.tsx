import {StyleSheet, Text, View} from 'react-native';

type InfoCardProps = {
  label: string;
  value: string;
};

const styles = StyleSheet.create({
  card: {
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
  value: {
    backgroundColor: '#FAFAFA',
    borderRadius: 4,
    padding: 4,
    margin: 4,
  },
});
const InfoCard = ({label, value}: InfoCardProps) => {
  return (
    <View style={styles.card}>
      <View style={{backgroundColor: '#EDE7F6', borderRadius: 8}}>
        <Text style={styles.addressLabel}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
};

export default InfoCard;
