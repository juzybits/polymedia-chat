import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ethos, SignInButton } from 'ethos-connect';
import { shortenAddress } from '../lib/common';
import '../../css/Nav.less';
import imgLogo from '../../img/logo.png';

export function Nav(props: any) {
    const { status, wallet } = ethos.useWallet();

    return <header id='nav' className='header'>

        <div id='nav-btn-menu' className='nav-btn'>
            {props.menuPath &&
                <span><Link to={props.menuPath}>{props.menuTitle||'MENU'}</Link></span>
            }
        </div>

        <div id='nav-btn-title' className=''>
        <span>
            <Link to='/'>
                <img id='home-logo' src={imgLogo} alt='Polymedia logo' />
                POLYMEDIA
            </Link>
        </span>
        </div>

        <div id='nav-btn-user' className='nav-btn'>
        {
            (wallet && wallet.address && status=='connected')
            ? <span id='nav-btn-disconnect' onClick={wallet.disconnect}>{shortenAddress(wallet.address)}</span>
            : <span id='nav-btn-connect' onClick={ethos.showSignInModal}>LOG IN</span>
        }
        </div>

    </header>;
}
