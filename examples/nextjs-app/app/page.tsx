'use client';

import { useAccount, useConnect, useDisconnect, useWalletClient } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { StorageClient, walletOnly } from '@lens-chain/storage-client';

type EvmAddress = `0x${string}`;
interface Signer {
    signMessage({ message }: {
        message: string;
    }): Promise<string>;
}

// TODO lensAccountOnly
async function upload (address: EvmAddress, chainId: number, storageClient: StorageClient) {
  const acl = walletOnly(address, chainId);
  const data = { state: 0 };
  const res = await storageClient.uploadAsJson(data, { acl }); // await if no return
  console.log(res);
}

async function modify (groveId: string, signer: Signer, address: EvmAddress, chainId: number, storageClient: StorageClient) {
  const acl = walletOnly(address, chainId);
  const data = { state: 1 };
  const response = await storageClient.updateJson(
    groveId,
    data,
    signer,
    { acl }
  );
  console.log(response)
}

function App() {
  const chainId = 37111; // chains.testnet.id
  const storageClient = StorageClient.create();
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { walletClient } = useWalletClient({ chainId });
  const TEST_GROVE_ID = 'lens://aa1affaac81f6e15ae06b13a6af6e1c64e55e60078476789dc675678d305b9a4';

  return (
    <>
      <div>
        <h2>Account</h2>
        <ConnectKitButton />

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === 'connected' && (
          <div>
            <button type="button" onClick={() => upload(account.addresses[0], chainId, storageClient)}>
              Upload
            </button>
            <button type="button" onClick={() => modify(TEST_GROVE_ID, walletClient, account.addresses[0], chainId, storageClient)}>
              Modify
            </button>
            <button type="button" onClick={() => disconnect()}>
              Disconnect
            </button>
          </div>
        )}
      </div>
      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>
    </>
  );
}

export default App;
