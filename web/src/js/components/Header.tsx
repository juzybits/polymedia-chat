import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ethos, SignInButton } from 'ethos-connect';
import { shortenAddress } from '../lib/common';
import imgLogo from '../../img/logo.png';

export function Header(props: any) {
    const { status, wallet } = ethos.useWallet();

    return <footer id='header'>

        <div id='header-btn-menu' className='header-btn'>
            <span><Link to={props.menuPath}>{props.menuTitle||'MENU'}</Link></span>
        </div>

        <div id='header-btn-title' className='header-btn'>
            <img src={imgLogo} alt='Polymedia logo' />
            <span><Link to='/'>POLYMEDIA</Link></span>
        </div>

        <div id='header-btn-user' className='header-btn'>
        {
            (wallet && wallet.address && status=='connected')
            ? <span id='header-btn-disconnect' onClick={wallet.disconnect}>{shortenAddress(wallet.address)}</span>
            : <span id='header-btn-connect' onClick={ethos.showSignInModal}>LOG IN</span>
        }
        </div>

    </footer>;
}
