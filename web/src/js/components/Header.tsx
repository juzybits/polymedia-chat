import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import imgLogo from '../../img/logo.png';

export function Header(props: any) {
    return <footer id='header'>
        <div id='header-menu-btn'>
            <span>MENU</span>
        </div>
        <div id='header-title-link'>
            <img src={imgLogo} alt='Polymedia logo' />
            <span>POLYMEDIA</span>
        </div>
        <div id='header-user-btn'>
            <span>CONNECT</span>
        </div>
    </footer>;
}
