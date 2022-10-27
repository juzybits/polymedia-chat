import React, { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { WalletProvider } from '@mysten/wallet-adapter-react';
import { WalletStandardAdapterProvider } from '@mysten/wallet-adapter-all-wallets';

export function App(props: any)
{
    const walletAdapters = useMemo(() => [new WalletStandardAdapterProvider()], []);
    return <WalletProvider adapters={walletAdapters}>
        <Outlet context={[]} />
    </WalletProvider>;
}
