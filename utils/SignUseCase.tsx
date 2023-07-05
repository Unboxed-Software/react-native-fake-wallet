import {Keypair, Signer, VersionedTransaction} from '@solana/web3.js';
import {sign} from '@solana/web3.js/src/utils/ed25519';

export default class SignUseCase {
  static readonly SIGNATURE_LEN = 64;
  static readonly PUBLIC_KEY_LEN = 32;

  static signTransaction(tsxBytes: Uint8Array, keypair: Keypair): Uint8Array {
    const tsx: VersionedTransaction =
      VersionedTransaction.deserialize(tsxBytes);
    const signer: Signer = {
      publicKey: keypair.publicKey,
      secretKey: keypair.secretKey,
    };
    tsx.sign([signer]);
    return tsx.serialize();
  }

  static signMessage(msgBytes: Uint8Array, keypair: Keypair) {
    return sign(msgBytes, keypair.secretKey.slice(0, 32));
  }
}
