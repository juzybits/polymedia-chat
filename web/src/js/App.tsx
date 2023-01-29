import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { EthosConnectProvider } from 'ethos-connect';
import imgLogo from '../img/logo.png';

export function App()
{
    const [notification, setNotification] = useState('');
    const notify = (text: string) => {
        setNotification(text);
        setTimeout(() => { setNotification('') }, 1200);
    };

    // Return either 'devnet' or 'testnet'
    const getNetwork = (): string => {
        // TODO: remove this in a few days
        const loc = window.location;
        if (loc.hostname == 'testnet.polymedia-chat.pages.dev') {
            loc.replace('https://chat.polymedia.app' + loc.pathname + '?network=testnet');
        }
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

    // NOTE: getNetwork and toggleNetwork are duplicated in polymedia-gotbeef/web/src/js/App.tsx

    return <EthosConnectProvider
        ethosConfiguration={{hideEmailSignIn: true}}
        dappName='Polymedia Chat'
        dappIcon={<img src={imgLogo} alt='Polymedia logo' />}
        connectMessage='Polymedia Chat'
        >
        {notification && <div className='notification'>{notification}</div>}
        <div id='network-widget'>
            <a className='switch-btn' onClick={toggleNetwork}>{network}</a>
        </div>
        <Outlet context={[notify, network]} />
    </EthosConnectProvider>;
}
