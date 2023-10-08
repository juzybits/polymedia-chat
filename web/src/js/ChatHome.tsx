import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.less';

export function ChatHome() {
    useEffect(() => {
        document.title = 'Polymedia Chat';
    }, []);

    return <div id='page' className='page-home'>

        <div className='home-welcome header'>
            <h1>
                <Link to='/'>
                    <img src='https://assets.polymedia.app/img/all/logo-nomargin-transparent-512x512.webp' alt='Polymedia logo' />
                    POLYMEDIA CHAT
                </Link>
            </h1>
            <p>
                Fully on-chain chat rooms on Sui.
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
                        <Link className='btn primary' to='/@sui-fans'>VIEW</Link>
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
            <Link className='btn primary' to='/new'>CREATE</Link>
        </div>

        <br/>
        <br/>
        <div className='home-section'>
            <h2>
                Stay in the loop
            </h2>
            <div className='home-links'>
                <a href='https://polymedia.app/' target='_blank' rel='noopener'>About</a> •&nbsp;
                <a href='https://discord.gg/3ZaE69Eq78' target='_blank' rel='noopener'>Discord</a> •&nbsp;
                <a href='https://twitter.com/polymedia_app' target='_blank' rel='noopener'>Twitter</a>
                <br/>
            </div>
        </div>

    </div>;
}
