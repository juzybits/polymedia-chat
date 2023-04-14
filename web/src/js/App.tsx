import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { WalletKitProvider } from '@mysten/wallet-kit';
import { Connection, JsonRpcProvider } from '@mysten/sui.js';
import { NetworkName, loadNetwork, loadRpcConfig } from '@polymedia/webutils';

export type AppContext = {
    network: NetworkName,
    rpcProvider: JsonRpcProvider,
    notify: (text: string) => void,
    connectModalOpen: boolean,
    setConnectModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
};

export function App()
{
    const [connectModalOpen, setConnectModalOpen] = useState(false);
    const [notification, setNotification] = useState('');
    const [network, setNetwork] = useState<NetworkName|null>(null);
    const [rpcProvider, setRpcProvider] = useState<JsonRpcProvider|null>(null);

    useEffect(() => {
        async function initialize() {
            const network = loadNetwork();
            const rpcConfig = await loadRpcConfig({
                network,
                customEndpoints: {
                    // devnet_fullnode: 'https://fullnode.devnet.sui.io'
                    // devnet_fullnode: 'https://node.shinami.com/api/v1/186668da9c42b69678719e785ed644a2',
                    // devnet_websocket: 'wss://node.shinami.com/ws/v1/186668da9c42b69678719e785ed644a2',
                    // testnet_fullnode: 'https://fullnode.testnet.sui.io',
                    // testnet_fullnode: 'https://node.shinami.com/api/v1/sui_testnet_c515e9bfb6cc1d541cbda378339a3cf9',
                    // testnet_websocket: 'wss://node.shinami.com/ws/v1/sui_testnet_c515e9bfb6cc1d541cbda378339a3cf9',
                }
            });
            const rpcProvider = new JsonRpcProvider(
                new Connection(rpcConfig),
                {
                    socketOptions: {
                        connectTimeout: 12000,
                        callTimeout: 12000,
                        reconnectInterval: 3000,
                        maxReconnects: 1,
                    },
                },
            );
            setNetwork(network);
            setRpcProvider(rpcProvider);
        };
        initialize();
    }, []);

    const notify = (text: string): void => {
        setNotification(text);
        setTimeout(() => { setNotification('') }, 1200);
    };

    if (!network || !rpcProvider) {
        return <></>;
    }

    const appContext: AppContext = {
        network,
        rpcProvider,
        notify,
        connectModalOpen,
        setConnectModalOpen,
    };

    return <WalletKitProvider>
        {notification && <div className='notification'>{notification}</div>}
        <Outlet context={appContext} />
    </WalletKitProvider>;
}
