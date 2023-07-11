import {Keypair, LAMPORTS_PER_SOL, clusterApiUrl} from '@solana/web3.js';
import SignUseCase from './SignUseCase';
import {MWARequestType} from '../lib/mobile-wallet-adapter-walletlib/src';

export const DEVNET_ENDPOINT = clusterApiUrl('devnet');

export const AIRDROP_LAMPORTS = 1 * LAMPORTS_PER_SOL;

export const convertLamportsToBalance = (lamports: number) => {
  return new Intl.NumberFormat(undefined, {maximumFractionDigits: 1}).format(
    (lamports || 0) / LAMPORTS_PER_SOL,
  );
};

export const getIconFromIdentityUri = (appIdentity?: any) => {
  if (
    appIdentity?.iconRelativeUri &&
    appIdentity.identityUri &&
    appIdentity.iconRelativeUri != 'null' &&
    appIdentity.identityUri != 'null'
  ) {
    return new URL(
      appIdentity.iconRelativeUri,
      appIdentity.identityUri,
    ).toString();
  } else {
    return require('../img/unknownapp.jpg');
  }
};

export const getSignedPayloads = (
  type: MWARequestType,
  wallet: Keypair,
  payloads: Uint8Array[],
): [boolean[], Uint8Array[]] => {
  const valid = payloads.map(_ => true);
  let signedPayloads;
  if (
    type == MWARequestType.SignTransactionsRequest ||
    type == MWARequestType.SignAndSendTransactionsRequest
  ) {
    signedPayloads = payloads.map((payload, index) => {
      try {
        return SignUseCase.signTransaction(new Uint8Array(payload), wallet);
      } catch (e) {
        console.log('sign error: ' + e);
        valid[index] = false;
        return new Uint8Array([]);
      }
    });
  } else {
    signedPayloads = payloads.map((payload, index) => {
      try {
        return SignUseCase.signMessage(new Uint8Array(payload), wallet);
      } catch (e) {
        console.log('sign error: ' + e);
        valid[index] = false;
        return new Uint8Array([]);
      }
    });
  }

  return [valid, signedPayloads];
};
