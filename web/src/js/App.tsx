import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SuiClient, SuiHTTPTransport } from '@mysten/sui.js/client';
import { WalletKitProvider } from '@mysten/wallet-kit';
import { NetworkName, isLocalhost, loadNetwork, getRpcConfig } from '@polymedia/webutils';
import { ProfileManager } from '@polymedia/profile-sdk';

import { registerSuiSnapWallet } from "@kunalabs-io/sui-snap-wallet";
registerSuiSnapWallet();

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
            const rpcConfig = await getRpcConfig({
                network,
                fetch: false,
                customEndpoints: {
                    mainnet_fullnode: 'https://mainnet.suiet.app',
                }
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
