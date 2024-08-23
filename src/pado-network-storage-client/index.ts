import { StorageType, WalletWithType } from '../types/index';
import ArseedingStorage from './arseeding-storage';
import ArweaveStorage from './arweave-storage';


const StorageClient = {
  arweave: ArweaveStorage,
  arseeding: ArseedingStorage
};
export default class PadoNetworkStorageClient {
  private _client: any;
  storageType: StorageType;
  constructor(storageType: StorageType = StorageType.ARWEAVE, wallet: WalletWithType) {
    this.storageType = storageType;
    this._client = new StorageClient[storageType](storageType,wallet);
  }

  /**
   * Asynchronously submits data using the client.
   *
   * This function takes in a byte array and a wallet object,
   * then uses the internal client to submit this data asynchronously.
   * The result of the submission is returned as a promise that resolves to a string.
   *
   * @param data - A Uint8Array representing the data to be submitted.
   * @param wallet - An object representing the wallet used for the submission.
   * @returns A Promise that resolves to a string, typically a confirmation or response from the submission.
   */
  async submitData(data: Uint8Array): Promise<string> {
    return await this._client.submitData(data);
  }

  /**
   * Asynchronously retrieves data associated with the specified transaction ID.
   *
   * This function calls the internal client's getData method, asynchronously fetching
   * the data related to the provided transaction ID and returns it as a Uint8Array.
   *
   * @param {string} transactionId - The unique identifier of the transaction for which data is to be fetched.
   * @returns {Promise<Uint8Array>} A promise that resolves to an array of bytes representing the data.
   */
  async getData(transactionId: string): Promise<Uint8Array> {
    return await this._client.getData(transactionId);
  }
}