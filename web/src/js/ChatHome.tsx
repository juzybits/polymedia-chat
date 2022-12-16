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
                    CHATS
                </Link>
            </h1>
            <p>
                Unstoppable conversations.
            </p>
        </div>

        <div className='home-section'>
            <h2>
                Explore chats
            </h2>

            <div className='home-categories'>
                <div className='category'>
                    <h3 className='category-title'>🌊&nbsp;&nbsp;Sui fans</h3>
                    <div className='category-description'>
                        A place to talk about all things Sui and connect with early adopters.
                        <br/>
                        <Link className='btn primary' to='/chat/0x0a4e825bfc5fc84d649a1fa72de346ec537a11ee'>VIEW</Link>
                    </div>
                </div>
                <div className='category'>
                    <h3 className='category-title'>🫵&nbsp;&nbsp;Your chat</h3>
                    <div className='category-description'>
                        Let us know if you'd like to feature your chat here.
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
