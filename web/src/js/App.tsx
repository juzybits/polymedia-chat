import React, { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { EthosConnectProvider } from 'ethos-connect';
import imgLogo from '../img/logo.png';

export function App(props: any)
{
    const [notification, setNotification] = useState('');
    const notify = (text: string) => {
        setNotification(text);
        setTimeout(() => { setNotification('') }, 1200);
    };

    return <EthosConnectProvider
        ethosConfiguration={{hideEmailSignIn: true}}
        dappName='Polymedia'
        dappIcon={<img src={imgLogo} alt='Polymedia logo' />}
        connectMessage='POLYMEDIA'
    >
        {notification && <div className='notification'>{notification}</div>}
        <div id='layout'>
            <Outlet context={[notify]} />
        </div>
    </EthosConnectProvider>;
}
