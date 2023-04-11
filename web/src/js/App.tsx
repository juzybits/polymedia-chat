import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { WalletKitProvider } from '@mysten/wallet-kit';
import { Connection, JsonRpcProvider } from '@mysten/sui.js';
import { NetworkName, loadNetwork, loadRpcConfig } from '@polymedia/webutils';

export type AppContext = {
    network: NetworkName,
    rpcProvider: JsonRpcProvider,
    rpcProviderWss: JsonRpcProvider,
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
    const [rpcProviderWss, setRpcProviderWss] = useState<JsonRpcProvider|null>(null);

    useEffect(() => {
        async function initialize() {
            const network = loadNetwork();
            const rpcConfig = await loadRpcConfig({network});
            const rpcProvider = new JsonRpcProvider(new Connection(rpcConfig));
            const rpcConfigWss = await loadRpcConfig({network, websocket: true});
            const rpcProviderWss = new JsonRpcProvider(new Connection(rpcConfigWss));
            setNetwork(network);
            setRpcProvider(rpcProvider);
            setRpcProviderWss(rpcProviderWss);
        };
        initialize();
    }, []);

    const notify = (text: string): void => {
        setNotification(text);
        setTimeout(() => { setNotification('') }, 1200);
    };

    if (!network || !rpcProvider || !rpcProviderWss) {
        return <></>;
    }

    const appContext: AppContext = {
        network,
        rpcProvider,
        rpcProviderWss,
        notify,
        connectModalOpen,
        setConnectModalOpen,
    };

    return <WalletKitProvider>
        {notification && <div className='notification'>{notification}</div>}
        <Outlet context={appContext} />
    </WalletKitProvider>;
}
