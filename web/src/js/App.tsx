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

    return <EthosConnectProvider
        ethosConfiguration={{hideEmailSignIn: true}}
        dappName='Polymedia Chat'
        dappIcon={<img src={imgLogo} alt='Polymedia logo' />}
        connectMessage='Polymedia Chat'
        >
        {notification && <div className='notification'>{notification}</div>}
        <Outlet context={[notify]} />
    </EthosConnectProvider>;
}
