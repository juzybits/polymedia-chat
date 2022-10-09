import React, { useEffect } from 'react';

export function Home(props) {
    useEffect(() => {
        document.title = 'Journey';
    }, []);

    var width = window.innerWidth // TODO: dynamic resize
    || document.documentElement.clientWidth
    || document.body.clientWidth;

    var height = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;

    return <section className='outlet'>

        <h1>Akira Bangers</h1>

        <iframe id='video-iframe' width={width} height={height}
            src='https://www.youtube.com/embed/UD0N7qjmrKY?controls=0&autoplay=1'
            title='Journey video player' frameBorder='0'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen>
        </iframe>

    </section>;
}
