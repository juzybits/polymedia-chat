import React, { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { EthosConnectProvider } from 'ethos-connect';
import imgLogo from '../img/logo.png';

export function App(props: any)
{
    return <EthosConnectProvider
        ethosConfiguration={{hideEmailSignIn: true}}
        dappName='Polymedia'
        dappIcon={<img src={imgLogo} alt='Polymedia logo' />}
        connectMessage='POLYMEDIA'
    >
        <div id='layout'>
            <Outlet context={[]} />
        </div>
    </EthosConnectProvider>;
}
