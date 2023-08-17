import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SuiClient, SuiHTTPTransport } from '@mysten/sui.js/client';
import { WalletKitProvider } from '@mysten/wallet-kit';
import { NetworkName, isLocalhost, loadNetwork, loadRpcConfig } from '@polymedia/webutils';
import { ProfileManager } from '@polymedia/profile-sdk';

export type AppContext = {
    network: NetworkName,
    suiClient: SuiClient,
    profileManager: ProfileManager
    notify: (text: string) => void,
    connectModalOpen: boolean,
    setConnectModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
};

export function App()
{
    const [connectModalOpen, setConnectModalOpen] = useState(false);
    const [notification, setNotification] = useState('');
    const [network, setNetwork] = useState<NetworkName|null>(null);
    const [suiClient, setSuiClient] = useState<SuiClient|null>(null);
    const [profileManager, setProfileManager] = useState<ProfileManager|null>(null);

    useEffect(() => {
        async function initialize() {
            const network = isLocalhost() ? loadNetwork() : 'mainnet';
            const rpcConfig = await loadRpcConfig({
                network,
                noFetch: true,
                // customEndpoints: {
                    // devnet_fullnode: 'https://fullnode.devnet.sui.io'
                    // devnet_fullnode: 'https://node.shinami.com/api/v1/186668da9c42b69678719e785ed644a2',
                    // devnet_websocket: 'wss://node.shinami.com/ws/v1/186668da9c42b69678719e785ed644a2',

                    // testnet_fullnode: 'https://fullnode.testnet.sui.io',
                    // testnet_fullnode: 'https://rpc-testnet.suiscan.xyz',
                    // testnet_fullnode: 'https://sui-rpc.testnet.lgns.net',
                    // testnet_fullnode: 'https://sui-testnet.nodeinfra.com',
                    // testnet_fullnode: 'https://fullnode.testnet.vincagame.com',

                    // testnet_fullnode: 'https://node.shinami.com/api/v1/sui_testnet_c515e9bfb6cc1d541cbda378339a3cf9',
                    // testnet_websocket: 'wss://node.shinami.com/ws/v1/sui_testnet_c515e9bfb6cc1d541cbda378339a3cf9',
                // }
            });

            const suiClient = new SuiClient({
                transport: new SuiHTTPTransport({
                    url: rpcConfig.fullnode,
                    websocket: {
                        url: rpcConfig.websocket,
                        callTimeout: 12000,
                        reconnectTimeout: 3000,
                        maxReconnects: 1,
                    },
                }),
            });

            setNetwork(network);
            setSuiClient(suiClient);
            setProfileManager( new ProfileManager({network, suiClient}) );
        };
        initialize();
    }, []);

    const notify = (text: string): void => {
        setNotification(text);
        setTimeout(() => { setNotification('') }, 1200);
    };

    if (!network || !suiClient || !profileManager) {
        return <></>;
    }

    const appContext: AppContext = {
        network,
        suiClient,
        profileManager,
        notify,
        connectModalOpen,
        setConnectModalOpen,
    };

    return <WalletKitProvider>
        {notification && <div className='notification'>{notification}</div>}
        <Outlet context={appContext} />
    </WalletKitProvider>;
}
