import type {
  ChainName,
} from '../../types/index';
import abiJson from './abi/workerMgt.json';
import BaseEvm from './base-evm';


export default class Worker extends BaseEvm {
  constructor(chainName: ChainName, wallet: any,address: string) {
    super(chainName, wallet,address);
    this._initContractInstance(abiJson);
  }

}