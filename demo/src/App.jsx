import {useCallback, useEffect, useRef, useState} from 'react';
import './App.css';
import Arweave from 'arweave';
import {getWalletBalance} from './script/arseeding.js';
import {Input, Select, Spin} from 'antd';
import {StorageType, TaskType} from '../../src/types/index';
import PadoNetworkContractClient from '../../src/pado-network-contract-client/index';
import Everpay from 'everpay';
import {ethers} from 'ethers';
import {userKey} from './config/config';
import Utils from '../../src/common/utils';



function App() {
    const [cliecked, setCliecked] = useState();
    const [address, setAddress] = useState();
    const [metamaskAddress, setMetamaskAddress] = useState();
    const [fileContent, setFileContent] = useState('');
    const [storageType, setStorageType] = useState();
    const [chainName, setChainName] = useState();
    const [fileContent2, setFileContent2] = useState('');
    const [fileContent3, setFileContent3] = useState('');
    const fileInputRef = useRef(null);
    const fileInputRef2 = useRef(null);
    const fileInputRef3 = useRef(null);
    const [arweaveBalance, setArweaveBalance] = useState(null);
    const [arseedingNeedFee, setArseedingNeedFee] = useState(0);
    const [downloadLink, setDownloadLink] = useState(null);
    const [padoSdkUploading, setPadoSdkUploading] = useState(false);
    const [arweaveUploading, setArweeaveUploading] = useState(false);
    const [arseedingUploading, setArseedingUploading] = useState(false);
    const [arseedingSymbols, setArseedingSymbols] = useState([]);
    const [dataId, setDataId] = useState(null);
    const [userDataId, setUserDataId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedSymbol, setSelectedSymbol] = useState();
    const [taskMsg, setTaskMsg] = useState(null);
    const [taskId, setTaskId] = useState(null);
    const tag = 'arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0x4fadc7a98f2dc96510e42dd1a74141eeae0c1543';
    const [storageTypeOps, setStorageTypeOps] = useState();
    const supportChains = [
        {value: 'holesky', label: 'holesky'},
        {value: 'ao', label: 'ao'}, {
            value: 'ethereum',
            label: 'ethereum'
        }];
    const [everpayBalance, setEverpayBalance] = useState(null);
    //You should generate a new one keypair for every task
    const keyInfo  =userKey;
    //If you don't want to use fixed key, you can generate a new one by Utils.generateKey()
    //const keyInfo = await new Utils().generateKey();


    // const base64Data = arseedingHexStrToBase64('0x4f6f55516873635a3231716a783452746166687277624436376b486d37727273594e393850494847375941')
    // console.log('arseedingHexStrToBase64',base64Data)
    // console.log('arseedingBase64ToHexStr',arseedingBase64ToHexStr(base64Data))

    const printTokenTag = async () => {
        const everpay = await new Everpay();
        everpay.info().then(info => {
            console.log(info.tokenList);
            const symbols = info.tokenList.map(token => {
                const rsp = {};
                rsp['value'] = token.tag;
                rsp['label'] = token.symbol + ' | ' + token.chainType;
                return rsp;
            }).sort((a, b) => a.label.localeCompare(b.label));
            console.log(symbols);
            setArseedingSymbols(symbols);
        });
    };

    useEffect(() => {
        if (storageType === 'arseeding') {
            printTokenTag();
        }
    }, [storageType]);

    //for development,need arlocal
    const ARConfig = {
        host: '127.0.0.1',
        port: 1984,
        protocol: 'http'
    };
    //for production
    // export const ARConfig = {
    //     host: 'arweave.net',
    //     port: 443,
    //     protocol: 'https'
    // };

    const arweave = Arweave.init(ARConfig);

    const connectWallet = async () => {
        setCliecked(true);
        try {
            await window.arweaveWallet.connect(// request permissions to read the active address
                ['ACCESS_ADDRESS', 'SIGN_TRANSACTION', 'ACCESS_PUBLIC_KEY']);
        } catch (e) {
            console.log(e);
            setCliecked(false);
        } finally {
            setCliecked(false);
        }
        const addressTmp = await window.arweaveWallet.getActiveAddress();

        setAddress(addressTmp);
        const balance = await getWalletBalance(tag);
        console.log(balance);
        setArweaveBalance(balance);
        console.log('connect success!');
    };

    const connectMetamask = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        console.log(window.ethereum.selectedAddress);
        setMetamaskAddress(address);
        console.log(address);
    };

    const handleFileChange = async (event) => {
        await setIsUploading(true);
        try {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.readAsArrayBuffer(file);
                reader.onload = async (e) => {
                    const content = e.target.result;
                    setFileContent(content);
                    console.log(content.byteLength);
                    console.log(content);
                    await setIsUploading(false);
                };
            }
        } catch (e) {
            console.log(e);
        } finally {
            await setPadoSdkUploading(false);
        }
    };

    async function submitData() {
        if (!fileContent) {
            throw new Error('no content');
        }
        const data = new Uint8Array(fileContent);
        // tag for the data
        let dataTag = {'name': 'test'};
        let symbol = 'ETH';
        let price = 1_000_000_000_000;
        if (chainName === 'ao') {
            symbol = 'wAR';
            price = 1000000;
        }
        // price for the data
        let priceInfo = {
            price: price,
            symbol: symbol
        };

        //chainName will provided by caller
        const wallet = getWallet();
        const padoNetworkClient = new PadoNetworkContractClient(chainName, wallet, storageType);

        const dataId = await padoNetworkClient.uploadData(data, dataTag, priceInfo, {t: 4, n: 4});

        // upload your data (If you want to do a local test, refer to the README to initialize arweave and then pass it to uploadData)
        console.log(`DATAID=${dataId}`);
        setDataId(dataId);
    }

    function getWallet() {
        if (chainName === 'ao') {
            return window.arweaveWallet;
        } else {
            return window.ethereum;
        }
    }


    function clearFile() {
        fileInputRef.current.value = '';
    }

    function handleStorageTypeChnage(value) {
        console.log('choose type:', value);
        setStorageType(value);
    }

    function handleChainNameChnage(value) {
        console.log('choose chain:', value);
        if (value === 'ao') {
            const storageTypeOpsTmp = [{value: 'arweave', label: 'arweave'}];
            setStorageTypeOps(storageTypeOpsTmp);
            setStorageType();
        } else {
            const storageTypeOpsTmp = [{value: 'arseeding', label: 'arseeding'}];
            setStorageTypeOps(storageTypeOpsTmp);
            setStorageType();
        }
        setChainName(value);
    }


    async function handleSymbolChange(value) {
        console.log('chose symbol', value);
        setSelectedSymbol(value);
        const balance = await getWalletBalance(value);
        console.log(balance);
        setEverpayBalance(balance);
    }


    async function submitTaskAndGetResult() {
        const wallet = getWallet();
        const padoNetworkClient = new PadoNetworkContractClient(chainName, wallet, storageType);
        const taskId = await padoNetworkClient.submitTask(TaskType.DATA_SHARING, userDataId, keyInfo.pk);
        setTaskMsg(taskId);
        // const taskId = '0x3a1c133a8504cc9e3462f97c1c9348043c35a6052e7da58a1cef78956c9576ef';
        console.log(`taskId:${taskId}`);
        const data = await padoNetworkClient.getTaskResult(taskId, keyInfo.sk, 200000);
        console.log(`data:${data}`);
        //for test
        if (data) {
            downloadArrayBufferAsFile(data, 'raw_data_file');
        }
        // const interval = setInterval(async () => {
        //
        // }, 10000)
    }

    // async function getTaskResult() {
    //     const wallet = getWallet();
    //     const keyInfo = await new Utils().generateKey();
    //     const padoNetworkClient = new PadoNetworkContractClient(chainName, wallet, storageType);
    //     const taskId = await padoNetworkClient.submitTask(TaskType.DATA_SHARING, userDataId, keyInfo.pk)
    //     setTaskMsg(taskId)
    //     // const taskId = '0x3a1c133a8504cc9e3462f97c1c9348043c35a6052e7da58a1cef78956c9576ef';
    //     console.log(`taskId:${taskId}`);
    //     const data = await padoNetworkClient.getTaskResult(taskId, keyInfo.sk, 200000);
    //     console.log(`data:${data}`)
    //     //for test
    //     if (data) {
    //         downloadArrayBufferAsFile(data, 'raw_data_file')
    //     }
    //     // const interval = setInterval(async () => {
    //     //
    //     // }, 10000)
    // }

    function downloadArrayBufferAsFile(data, fileName) {
        const blob = new Blob([data], {type: 'application/octet-stream'});

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;

        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    async function userDataIdChange(value) {
        console.log('dataId:', value);
        setUserDataId(value);
    }

    async function taskIdChange(value) {
        console.log('dataId:', value);
        setTaskId(value);
    }

    async function taskIdChange(value) {
        console.log('taskId:', value);
        setTaskId(value);
    }


    return (<>

        <h2>Choose Chain and Storage Type</h2>
        <div>
            chainName:<Select style={{width: '200px'}} options={supportChains}
                              onChange={handleChainNameChnage}
        ></Select>
        </div>
        <div>
            {chainName && <div>storageType:<Select style={{width: '200px'}} options={storageTypeOps}
                                                   onChange={handleStorageTypeChnage} value={storageType}
                                                   defaultValue={storageType}></Select></div>}
        </div>
        {/*{storageType === 'arseeding' && (*/}
        {/*    <div>*/}
        {/*        symbols:<Select style={{width: '200px'}} options={arseedingSymbols}*/}
        {/*                        defaultValue={arseedingSymbols[0]} onChange={handleSymbolChange}></Select>*/}
        {/*    </div>*/}

        {/*)*/}
        {/*}*/}
        {/*{*/}
        {/*    everpayBalance && (<div>balance: {everpayBalance}</div>)*/}
        {/*}*/}

        <hr/>
        <h2>Connect Wallet</h2>
        {chainName === 'ao' &&
            <div className="card">
                <button disabled={cliecked} onClick={connectWallet}>
                    Connect ArConnect
                </button>
                <br/>
                {address && <a>{address}</a>}
                <br/>
                {arweaveBalance && <a>AR:{arweaveBalance}</a>}
            </div>
        }
        {(chainName === 'holesky' || chainName === 'ethereum') &&

            <div className="card2">
                <button disabled={cliecked} onClick={connectMetamask}>
                    Connect Metamask
                </button>
                <br/>
                {metamaskAddress && <a>{metamaskAddress}</a>}
                {/*<br/>*/}
                {/*{arweaveBalance && <a>AR:{arweaveBalance}</a>}*/}
            </div>
        }
        <hr/>
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between'
        }}>
            <div className="card">
                <h2>Upload File(Data Provider)</h2>
                <div className="card">
                    <input type="file"
                           name="myFile"
                           ref={fileInputRef}
                           onChange={handleFileChange}/>
                    <button onClick={clearFile}>Clear file</button>
                </div>
                {isUploading && <Spin tip={'Uploading...'} size="small">Uploading</Spin>}
                {dataId && <div>DATAID: <a style={{color: 'red'}}>{dataId}</a></div>}
                <button onClick={submitData}>submitData</button>


            </div>
            <div className="card">
                <h2>Submit task and get result(Data User)</h2>
                <input placeholder={'dataId'} onChange={(e) => userDataIdChange(e.target.value)}/>
                {taskMsg && <Spin size="small" tip={taskMsg}>{taskMsg}</Spin>}
                <button onClick={submitTaskAndGetResult}>submitTaskAndGetResult</button>
            </div>
        </div>
        <hr/>
        {/*<div className="card">*/}
        {/*    <h2>get task result(Data User)</h2>*/}
        {/*    <input placeholder={'taskId'} onChange={(e) => userDataIdChange(e.target.value)}/>*/}
        {/*    <button onClick={submitTaskAndGetResult}>getTaskResult</button>*/}
        {/*</div>*/}

    </>);
}


export default App;
