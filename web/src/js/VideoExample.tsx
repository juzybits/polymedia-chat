import React, { useEffect } from 'react';

export function VideoExample(props) {
    useEffect(() => {
        document.title = 'VideoExample';
    }, []);

    var width = window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;

    var height = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;

    return <section className='main'>

        <h1>Akira Bangers</h1>

        <iframe id='video-iframe' width={width} height={height}
            src='https://www.youtube.com/embed/UD0N7qjmrKY?controls=0&autoplay=1'
            title='Polymedia video player' frameBorder='0'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen>
        </iframe>

    </section>;
}
