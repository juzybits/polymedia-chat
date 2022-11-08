import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export function DevPage(props: any) {
    useEffect(() => {
        document.title = 'Polymedia - DevPage';
    }, []);

    return <div id='page'>

        <h1>DevPage</h1>

        <Link to='/item/create'>CREATE</Link>
        <br/>
        <br/>
        <Link to='/item/view/123'>VIEW</Link>
        <br/>
        <br/>
        <Link to='/samples'>SAMPLES</Link>

    </div>;
}
