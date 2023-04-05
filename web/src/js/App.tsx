import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { WalletKitProvider } from '@mysten/wallet-kit';
import { currentNetwork as network } from '@polymedia/webutils';

export function App()
{
    const [connectModalOpen, setConnectModalOpen] = useState(false);
    const [notification, setNotification] = useState('');
    const notify = (text: string) => {
        setNotification(text);
        setTimeout(() => { setNotification('') }, 1200);
    };

    return <WalletKitProvider>
        {notification && <div className='notification'>{notification}</div>}
        <Outlet context={[notify, network, connectModalOpen, setConnectModalOpen]} />
    </WalletKitProvider>;
}
