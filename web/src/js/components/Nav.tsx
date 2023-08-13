/// Navigation bar

import { ReactNode, useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useWalletKit, ConnectModal } from '@mysten/wallet-kit';

import { NetworkSelector } from '@polymedia/react-components';
import { NetworkName, isLocalhost } from '@polymedia/webutils';
import { AppContext } from '../App';
import '../../css/Nav.less';
import imgLogo from '../../img/logo.png';
import { PolymediaProfile } from '@polymedia/profile-sdk';

type NavProps = {
    network: NetworkName,
    menuPath?: string,
    menuTitle?: string | ReactNode,
}

export function Nav({ network, menuPath, menuTitle }: NavProps)
{
    const {
        profileManager,
        connectModalOpen,
        setConnectModalOpen
    } = useOutletContext<AppContext>();
    const { currentAccount, disconnect } = useWalletKit();
    const showNetworkSelector = isLocalhost();
    const [ userProfile, setUserProfile ] = useState<PolymediaProfile|null>(null);

    useEffect(() => {
        const reloadUserProfile = async () => {
            if (!currentAccount) {
                setUserProfile(null);
            } else {
                const profile = await profileManager.getProfile({
                    lookupAddress: currentAccount.address
                });
                setUserProfile(profile);
            }
        };
        reloadUserProfile();
    }, [currentAccount]);

    return <>
        <ConnectModal
            open={connectModalOpen}
            onClose={() => { setConnectModalOpen(false); }}
        />
        <header id='nav' className='header'>

            <div id='nav-btn-menu' className='nav-btn'>
                { menuPath && <span><Link to={menuPath}>{menuTitle||'MENU'}</Link></span> }
            </div>

            <div id='nav-title'>
            <span>
                <Link to='/'>
                    <img id='home-logo' src={imgLogo} alt='Polymedia logo' />
                    <span id='nav-title-polymedia'>POLYMEDIA</span>
                    <span id='nav-title-chat'>&nbsp;CHAT</span>
                </Link>
            </span>
            </div>

            <div id='nav-btn-user' className='nav-btn'>
            {currentAccount
            ?
                <span
                    id='nav-btn-disconnect'
                    onClick={ async () => {
                        await disconnect();
                        setConnectModalOpen(true);
                    }
                }>{
                    userProfile
                    ? userProfile.name
                    : '@' + currentAccount.address.slice(2, 6)
                }</span>
            :
                <span id='nav-btn-connect'
                      onClick={() => setConnectModalOpen(true)}>
                    LOG IN
                </span>
            }
            {showNetworkSelector && <NetworkSelector currentNetwork={network} />}
            </div>

        </header>
    </>;
}
