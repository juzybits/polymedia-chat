import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.less';
import imgLogo from '../img/logo.png';

export function Home(props: any) {
    useEffect(() => {
        document.title = 'Polymedia';
    }, []);

    return <div id='page' className='page-home'>

        <div className='home-welcome header'>
            <h1>
                <Link to='/'>
                    <img src={imgLogo} alt='Polymedia logo' />
                    POLYMEDIA
                </Link>
            </h1>
            <p>
                Fully on-chain social media on Sui.
            </p>
        </div>

        <div className='home-section'>
            <h2>
                Explore
            </h2>

            <div className='home-categories'>
                <div className='category'>
                    <h3 className='category-title'>Chat</h3>
                    <div className='category-description'>
                        Unstoppable chats
                        <br/>
                        <Link className='btn primary' to='/chat'>EXPLORE</Link>
                    </div>
                </div>
                <div className='category'>
                    <h3 className='category-title'>More</h3>
                    <div className='category-description'>
                        Coming soon...
                    </div>
                </div>
            </div>
        </div>

        <div className='home-section'>
            <h2>
                Stay in the loop
            </h2>
            <div className='home-links'>
                <a href='https://twitter.com/polymedia_app'>Twitter</a> •&nbsp;
                <a href='https://discord.gg/3ZaE69Eq78'>Discord</a>
                <br/>
            </div>
        </div>

    </div>;
}
