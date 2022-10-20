import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export function Home(props) {
    useEffect(() => {
        document.title = 'Polymedia';
    }, []);

    return <div id='page'>

        <h1>Home</h1>

        <Link to='/item/create'>CREATE</Link>
        <br/>
        <br/>
        <Link to='/item/view/123'>VIEW</Link>
        <br/>
        <br/>
        <Link to='/samples'>SAMPLES</Link>

    </div>;
}
