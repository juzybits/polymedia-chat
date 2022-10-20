import React, { useEffect } from 'react';

export function SampleVideo(props) {
    useEffect(() => {
        document.title = 'SampleVideo';
    }, []);

    var width = window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;

    var height = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;

    return <div id='page-video'>

        <section className='video-menu'>
            <h1>Video title</h1>
            <p>Lorem ipsum dolor sit amet.</p>
        </section>

        <iframe id='video-iframe' width={width} height={height}
            src='https://www.youtube.com/embed/UD0N7qjmrKY?controls=0&autoplay=1'
            title='Polymedia video player' frameBorder='0'
            allow='accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen>
        </iframe>

    </div>;
}
