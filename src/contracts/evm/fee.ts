import type { Address, Balance, Bytes32, FeeTokenInfo, Uint256 } from '../../types/index';
import { ChainName } from '../../types/index';
import BaseEvm from './base-evm';
import abiJson from './abi/feeMgt.json';

export default class Fee extends BaseEvm {
  
  feeTokens: FeeTokenInfo[] ;
  /**
   * @param chainName The name of the chain, used to identify and differentiate between different chains.
   * @param provider The provider object for the blockchain, used to establish and manage the connection with the blockchain.
   */
  constructor(chainName: ChainName, provider: any = (window as any).ethereum, address: string) {
    super(chainName,provider,address);
    this.feeTokens = [];
    this._initContractInstance(abiJson);
  }

  /**
   * @notice Get the all fee tokens.
   * @return Returns the all fee tokens info.
   */
  async getFeeTokens(): Promise<FeeTokenInfo[]> {
    const tokens = await this.contractInstance.getFeeTokens();
    return tokens;
  }

  /**
   * @notice Determine whether a token can pay the handling fee.
   * @return Returns true if a token can pay fee, otherwise returns false.
   */
  async isSupportToken(tokenSymbol: string): Promise<boolean> {
    const isSupport = await this.contractInstance.isSupportToken(tokenSymbol);
    return isSupport;
  }

  /**
   * @notice Get fee token by token symbol.
   * @param tokenSymbol The token symbol.
   * @return Returns the fee token.
   */
  async getFeeTokenBySymbol(tokenSymbol: string): Promise<FeeTokenInfo> {
    const feeToken = await this.contractInstance.getFeeTokenBySymbol(tokenSymbol);
    return feeToken;
  }

  /**
   * @notice Get allowance info.
   * @param dataUser The address of data user
   * @param tokenSymbol The token symbol for the data user
   * @return Allowance for the data user
   */
  async getAllowance(userAddress: Address, tokenSymbol: string): Promise<Balance> {
    const allowance = await this.contractInstance.getAllowance(userAddress, tokenSymbol);
    return allowance;
  }

  /**
   * @notice TaskMgt contract request locking fee.
   * @param taskId The task id.
   * @param submitter The submitter of the task.
   * @param tokenSymbol The fee token symbol.
   * @param workerOwners The owner address of all workers which have already run the task.
   * @param dataPrice The data price of the task.
   * @param dataProviders The address of data providers which provide data to the task.
   * @return Returns true if the settlement is successful.
   */
  async lock(
    taskId: Bytes32,
    submitter: Address,
    tokenSymbol: string,
    workerOwners: Address[],
    dataPrice: Uint256,
    dataProviders: Address[]
  ): Promise<Balance> {
    const allowance = await this.contractInstance.lock(
      taskId,
      submitter,
      tokenSymbol,
      workerOwners,
      dataPrice,
      dataProviders
    );
    return allowance;
  }

  /**
   * @notice TaskMgt contract request transfer tokens.
   * @param from The address from which transfer token.
   * @param tokenSymbol The token symbol
   * @param amount The amount of tokens to be transfered
   */
  async transferToken(from: Address, tokenSymbol: string, amount: Uint256): Promise<Balance> {
    const allowance = await this.contractInstance.transferToken(from, tokenSymbol, amount);
    return allowance;
  }

  /**
   * @notice Get balance of token which can withdraw.
   * @param userAddress user wallet address
   * @param tokenSymbol token symbol
   */
  async getBalance(userAddress: Address, tokenSymbol: string){
    return await this.contractInstance.getBalance(userAddress, tokenSymbol);
  }

  /**
   * withdraw token
   * @param userAddress user wallet address
   * @param tokenSymbol token symbol
   * @param amount withdraw amount
   */
  async withdrawToken(userAddress: Address, tokenSymbol: string, amount: Uint256){
    const tx= await this.contractInstance.withdrawToken(userAddress, tokenSymbol, amount);
    return await tx.wait();
  }
}