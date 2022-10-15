import React, { useEffect } from 'react';

export function Home(props) {
    useEffect(() => {
        document.title = 'Polymedia';
    }, []);

    return <section className='outlet'>

        <h1>Home</h1>

    </section>;
}
