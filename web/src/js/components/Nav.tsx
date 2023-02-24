/// Navigation bar

import { ReactNode } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useWalletKit, ConnectModal } from '@mysten/wallet-kit';

import '../../css/Nav.less';
import imgLogo from '../../img/logo.png';

type NavProps = {
    menuPath?: string,
    menuTitle?: string | ReactNode,
}

export function Nav({ menuPath, menuTitle }: NavProps)
{
    const { currentAccount, disconnect } = useWalletKit();
    const [_notify, _network, connectModalOpen, setConnectModalOpen]: any = useOutletContext();

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
                <span id='nav-btn-disconnect'
                      onClick={ async () => { await disconnect(); setConnectModalOpen(true); } }>
                    {'@' + currentAccount.slice(2, 6)}
                </span>
            :
                <span id='nav-btn-connect'
                      onClick={() => setConnectModalOpen(true)}>
                    LOG IN
                </span>
            }
            </div>

        </header>
    </>;
}
