import { AbstractConnector } from '@web3-react/abstract-connector';
import SafeAppsSDK, { SafeInfo } from '@gnosis.pm/safe-apps-sdk';

// taken from ethers.js, compatible interface with web3 provider
type AsyncSendable = {
  isMetaMask?: boolean;
  host?: string;
  path?: string;
  sendAsync?: (
    request: any,
    callback: (error: any, response: any) => void,
  ) => void;
  send?: (request: any, callback: (error: any, response: any) => void) => void;
};

function getLowerCase(value: string): string {
  if (value) {
    return value.toLowerCase();
  }
  return value;
}

class SafeAppProvider implements AsyncSendable {
  private readonly safe: SafeInfo;
  private readonly sdk: SafeAppsSDK;

  constructor(safe: SafeInfo, sdk: SafeAppsSDK) {
    this.safe = safe;
    this.sdk = sdk;
  }

  public get chainId(): number {
    return this.safe.chainId;
  }

  sendAsync(request: any, callback: (error: any, response: any) => void): void {
    this.send(request, callback);
  }

  send(request: any, callback: (error: any, response?: any) => void): void {
    if (!request) callback('Undefined request');
    this.request(request)
      .then((result) =>
        callback(null, { jsonrpc: '2.0', id: request.id, result }),
      )
      .catch((error) => callback(error, null));
  }

  async request(request: { method: string; params: any[] }): Promise<any> {
    const params = request.params;
    switch (request.method) {
      case 'net_version':
      case 'eth_chainId':
        return `0x${this.chainId.toString(16)}`;

      case 'eth_sendTransaction':
        console.error({ params });
        const tx = await this.sdk.txs.send({
          txs: params.map((tx) => {
            return {
              value: '0',
              data: '0x',
              ...tx,
            };
          }),
        });
        return tx.safeTxHash;

      case 'eth_blockNumber':
        const block = await this.sdk.eth.getBlockByNumber(['latest']);

        return block.number;

      case 'eth_getBalance':
        return this.sdk.eth.getBalance([getLowerCase(params[0]), params[1]]);

      case 'eth_getCode':
        return this.sdk.eth.getCode([getLowerCase(params[0]), params[1]]);

      case 'eth_getStorageAt':
        return this.sdk.eth.getStorageAt([
          getLowerCase(params[0]),
          params[1],
          params[2],
        ]);

      case 'eth_getBlockByNumber':
        return this.sdk.eth.getBlockByNumber([params[0], params[1]]);

      case 'eth_getBlockByHash':
        return this.sdk.eth.getBlockByHash([params[0], params[1]]);

      case 'eth_getTransactionByHash':
        let txHash = params[0];
        try {
          const resp = await this.sdk.txs.getBySafeTxHash(txHash);
          txHash = resp.txHash || txHash;
        } catch (e) {}
        return this.sdk.eth.getTransactionByHash([txHash]);

      case 'eth_getTransactionReceipt': {
        let txHash = params[0];
        try {
          const resp = await this.sdk.txs.getBySafeTxHash(txHash);
          txHash = resp.txHash || txHash;
        } catch (e) {}
        return this.sdk.eth.getTransactionReceipt([txHash]);
      }

      case 'eth_estimateGas': {
        return 0;
      }

      case 'eth_call': {
        return this.sdk.eth.call([params[0], params[1]]);
      }

      case 'eth_getLogs':
        return this.sdk.eth.getPastLogs([params[0]]);

      default:
        throw Error(`"${request.method}" not implemented`);
    }
  }
}

export class SafeAppConnector extends AbstractConnector {
  private readonly sdk = new SafeAppsSDK();
  private safe: SafeInfo | undefined;
  private provider: SafeAppProvider | undefined;

  async activate(): Promise<{
    provider: SafeAppProvider;
    chainId: number;
    account: string;
  }> {
    this.safe = await this.sdk.safe.getInfo();
    return {
      provider: await this.getProvider(),
      chainId: await this.getChainId(),
      account: await this.getAccount(),
    };
  }

  public async getSafeInfo(): Promise<SafeInfo> {
    if (!this.safe) {
      this.safe = await this.sdk.safe.getInfo();
    }
    return this.safe;
  }

  public async getProvider(): Promise<SafeAppProvider> {
    if (!this.provider) {
      const safe = await this.getSafeInfo();
      this.provider = new SafeAppProvider(safe, this.sdk);
    }
    return this.provider;
  }

  public async getChainId(): Promise<number> {
    const provider = await this.getProvider();
    return provider.chainId;
  }

  public async getAccount(): Promise<string> {
    const safe = await this.getSafeInfo();
    return safe.safeAddress;
  }

  public deactivate(): void {
    return;
  }
}
