import AsyncStorage from '@react-native-async-storage/async-storage';
import {Keypair} from '@solana/web3.js';
import {encode, decode} from 'bs58';
import {ReactNode, createContext, useContext, useEffect, useState} from 'react';

export type WalletContextType = {
  wallet: Keypair | null;
};

const WalletContext = createContext<WalletContextType>({
  wallet: null,
});

export const useWallet = () => useContext(WalletContext);

type EncodedKeypair = {
  publicKeyBase58: string;
  secretKeyBase58: string;
};

const ASYNC_STORAGE_KEY = '@my_fake_wallet_keypair_key';

const encodeKeypair = (keypair: Keypair): EncodedKeypair => {
  return {
    publicKeyBase58: keypair.publicKey.toBase58(),
    secretKeyBase58: encode(keypair.secretKey),
  };
};

const decodeKeypair = (encodedKeypair: EncodedKeypair): Keypair => {
  const secretKey = decode(encodedKeypair.secretKeyBase58);
  return Keypair.fromSecretKey(secretKey);
};

export const WalletProvider = ({children}: {children: ReactNode}) => {
  const [keyPair, setKeyPair] = useState<Keypair | null>(null);

  const generateKeypair = async () => {
    try {
      const storedKey = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
      let keyPair;
      if (storedKey && storedKey !== null) {
        const encodedKeypair: EncodedKeypair = JSON.parse(storedKey);
        keyPair = decodeKeypair(encodedKeypair);
      } else {
        // Generate a new random pair of keys and store them in local storage for later retrieval
        // This is not secure! Async storage is used for demo purpose. Never store keys like this!
        keyPair = await Keypair.generate();
        await AsyncStorage.setItem(
          ASYNC_STORAGE_KEY,
          JSON.stringify(encodeKeypair(keyPair)),
        );
      }
      setKeyPair(keyPair);
    } catch (e) {
      console.log('error getting keypair: ', e);
    }
  };

  useEffect(() => {
    generateKeypair();
  }, []);

  return (
    <WalletContext.Provider value={{wallet: keyPair}}>
      {children}
    </WalletContext.Provider>
  );
};
