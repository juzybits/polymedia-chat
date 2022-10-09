import React, { useEffect } from 'react';

export function Home(props) {
    useEffect(() => {
        document.title = 'Journey';
    }, []);

    return <section className='outlet'>
        <h1>Journey</h1>
        <div>
            It's not about the destination.
        </div>
    </section>;
}
