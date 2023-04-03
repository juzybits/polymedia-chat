import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { WalletKitProvider } from '@mysten/wallet-kit';

export function App()
{
    const [connectModalOpen, setConnectModalOpen] = useState(false);
    const [notification, setNotification] = useState('');
    const notify = (text: string) => {
        setNotification(text);
        setTimeout(() => { setNotification('') }, 1200);
    };
    const network = 'localnet';
    // Delete query string
    window.history.replaceState({}, document.title, window.location.pathname);
    /*
    // NOTE: getNetwork() and toggleNetwork() are duplicated in other Polymedia projects

    // Return either 'devnet' or 'testnet'
    const getNetwork = (): string => {
        // Read 'network' URL parameter
        const params = new URLSearchParams(window.location.search);
        // Delete query string
        window.history.replaceState({}, document.title, window.location.pathname);
        let newNetwork = params.get('network');
        if (newNetwork === 'devnet' || newNetwork === 'testnet') {
            // Update localStorage
            localStorage.setItem('polymedia.network', newNetwork);
            return newNetwork;
        } else {
            return localStorage.getItem('polymedia.network') || 'devnet';
        }
    };

    const [network, setNetwork] = useState( getNetwork() );

    const toggleNetwork = () => {
        const newNetwork = network==='devnet' ? 'testnet' : 'devnet';
        setNetwork(newNetwork);
        localStorage.setItem('polymedia.network', newNetwork);
        window.location.reload();
    };
    */

    return <WalletKitProvider>
        {notification && <div className='notification'>{notification}</div>}
        {/*<div id='network-widget'>
            <a className='switch-btn' onClick={toggleNetwork}>{network}</a>
        </div>*/}
        <Outlet context={[notify, network, connectModalOpen, setConnectModalOpen]} />
    </WalletKitProvider>;
}
