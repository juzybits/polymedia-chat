import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.less';
import imgLogo from '../img/logo.png';

export function ChatHome() {
    useEffect(() => {
        document.title = 'Polymedia Chat';
    }, []);

    return <div id='page' className='page-home'>

        <div className='home-welcome header'>
            <h1>
                <Link to='/'>
                    <img src={imgLogo} alt='Polymedia logo' />
                    POLYMEDIA CHAT
                </Link>
            </h1>
            <p>
                Unstoppable chat rooms on the Sui network.
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
                <a href='https://polymedia.app/'>Polymedia</a> •&nbsp;
                <a href='https://discord.gg/3ZaE69Eq78'>Discord</a> •&nbsp;
                <a href='https://twitter.com/polymedia_app'>Twitter</a>
                <br/>
            </div>
        </div>

    </div>;
}
