import {
  ChainName,
  CommonObject,
  EncryptionSchema,
  PriceInfo,
  StorageType, TaskType,
  WalletWithType
} from '../types/index';
import ArweaveContract from './arweave-contract';
import EthereumContract from './ethereum-contract';
import { DEFAULT_ENCRYPTION_SCHEMA } from '../config';

const ContractClient = {
  ao: ArweaveContract,
  holesky: EthereumContract,
  ethereum: EthereumContract
};
export default class PadoNetworkContractClient {
  private _client: any;
  private _storageType: StorageType;

  constructor(chainName: ChainName, wallet: any, storageType: StorageType = StorageType.ARSEEDING) {
    let walletType = 'arweave';
    if (chainName === 'holesky' || chainName === 'ethereum') {
      walletType = 'metamask';
    }
    let wallets: any = {};
    const walletInfo: WalletWithType = {
      wallet: wallet,
      walletType: walletType as any
    };
    const storageWalletInfo: WalletWithType = {
      wallet: wallet,
      walletType: walletType as any
    };
    wallets.wallet = walletInfo;
    wallets.storageWallet = storageWalletInfo;
    this._client = new ContractClient[chainName](chainName, storageType, wallets);
    this._storageType = storageType;
  }

  /**
   * Encrypt data and upload encrypted data to decentralized storage blockchains such as Arweave and Filecoin.
   *
   * @param data - plain data need to encrypt and upload
   * @param dataTag - the data meta info object
   * @param priceInfo - The data price symbol(symbol is optional, default is wAR) and price. Currently only wAR(the Wrapped AR in ao) is supported, with a minimum price unit of 1 (1 means 0.000000000001 wAR).
   * @param wallet - The ar wallet json object, this wallet must have AR Token. Pass `window.arweaveWallet` in a browser
   * @param encryptionSchema EncryptionSchema
   * @param extParam - The extParam object, which can be used to pass additional parameters to the upload process
   *                    - uploadParam : The uploadParam object, which can be used to pass additional parameters to the upload process
   *                        - storageType : The storage type, default is ARWEAVE
   *                        - symbolTag :  The tag corresponding to the token used for payment. ref: https://web3infra.dev/docs/arseeding/sdk/arseeding-js/getTokenTag
   * @returns The uploaded encrypted data id
   */
  async uploadData(
    data: Uint8Array,
    dataTag: CommonObject,
    priceInfo: PriceInfo,
    encryptionSchema: EncryptionSchema = DEFAULT_ENCRYPTION_SCHEMA
  ) {
    const dataId = this._client.uploadData(data, dataTag, priceInfo, encryptionSchema);
    return dataId;
  }

  /**
   * Asynchronously retrieves a list of data based on the specified status.
   * @param dataStatus - The status of the data to retrieve, defaults to 'Valid'.
   * @returns A promise that resolves to the retrieved data.
   */
  async getDataList(dataStatus: string = 'Valid') {
    const dataList = await this._client.getDataList(dataStatus);
    return dataList;
  }

  /**
   * Asynchronously retrieves data by the specified ID.
   * @param dataId The unique identifier of the data to retrieve.
   * @returns A promise that resolves to the retrieved data.
   */
  async getDataById(dataId: string) {
    const dataInfo = await this._client.getDataById(dataId);
    return dataInfo;
  }

  /**
   * Submits a task for processing with specific parameters.
   *
   * @param taskType - The type of task to be submitted.
   * @param dataId - The ID of the data to be processed in the task.
   * @param publicKey - The public key of the network consumer used for encryption.
   *
   * @returns A promise that resolves to the ID of the submitted task.
   */
  async submitTask(taskType: TaskType, dataId: string, publicKey: string) {
    const taskId = await this._client.submitTask(taskType, dataId, publicKey);
    return taskId;
  }

  /**
   * Asynchronously retrieves the result of a task.
   *
   * @param taskId The unique identifier for the task.
   * @param privateKey The private key used for decryption.
   * @param timeout The timeout duration in milliseconds, defaults to 10000ms.
   * @returns A promise that resolves to an array of unsigned 8-bit integers representing the task result.
   */
  async getTaskResult(taskId: string, privateKey: string, timeout: number = 10000): Promise<Uint8Array> {
    const taskResult = await this._client.getTaskResult(taskId, privateKey, timeout);
    return taskResult;
  }
}