import {
  Connection,
  SendOptions,
  VersionedTransaction,
  clusterApiUrl,
} from '@solana/web3.js';
import {decode} from 'bs58';

export class SendTransactionsError extends Error {
  valid: boolean[];
  constructor(message: string, valid: boolean[]) {
    super(message);
    this.name = 'SendTransactionErrors';
    this.valid = valid;
  }
}

export default class SendTranscationUseCase {
  static readonly SIGNATURE_LEN = 64;
  static readonly PUBLIC_KEY_LEN = 32;

  static async sendTransactions(
    signedTsxs: Array<Uint8Array>,
    minContextSlot: number | undefined,
  ): Promise<Uint8Array[]> {
    const connection = new Connection(clusterApiUrl('testnet'), 'finalized');
    const signatures = await Promise.all(
      signedTsxs.map(async tsx => {
        try {
          const vTsx = VersionedTransaction.deserialize(tsx);
          const sendOpts: SendOptions = {
            skipPreflight: true,
          };

          const sig = await connection.sendTransaction(vTsx, sendOpts);
          const decoded = decode(sig);
          return decoded;
        } catch (e) {
          console.log('Failed sending transaction ' + e);
          return null;
        }
      }),
    );

    if (signatures.includes(null)) {
      const valid = signatures.map(signature => {
        return signature !== null;
      });
      throw new SendTransactionsError('Failed sending transactions', valid);
    }

    return signatures as Uint8Array[];
  }
}
