import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.less';
import imgLogo from '../img/logo.png';

export function ChatHome(props: any) {
    useEffect(() => {
        document.title = 'Polymedia - Chat';
    }, []);

    return <div id='page' className='page-home'>

        <div className='home-welcome header'>
            <h1>
                <Link to='/'>
                    <img src={imgLogo} alt='Polymedia logo' />
                    POLYMEDIA/CHAT
                </Link>
            </h1>
            <p>
                Unstoppable chats.
            </p>
        </div>

        <div className='home-section'>
            <h2>
                Explore chats
            </h2>

            <div className='home-categories'>
                <div className='category'>
                    <h3 className='category-title'>Sui fans</h3>
                    <div className='category-description'>
                        A place to talk about all things Sui💧
                        <br/>
                        <Link className='btn primary' to='/chat/0x53979215bd97b1bd2349eccf110f6bbbcb270173'>VIEW</Link>
                    </div>
                </div>
                <div className='category'>
                    <h3 className='category-title'>Got Beef?</h3>
                    <div className='category-description'>
                        Find people to bet with on https://gotbeef.app
                        <br/>
                        <Link className='btn primary' to='/chat/0x8a7af9555088ac197b195c10866305ba56e52bcd'>VIEW</Link>
                    </div>
                </div>
            </div>
        </div>

        <div className='home-section'>
            <h2>
                Create chat
            </h2>
            Start your own chat room now. It's very simple!
            <br/>
            <Link className='btn primary' to='/chat/new'>CREATE</Link>
        </div>

    </div>;
}
