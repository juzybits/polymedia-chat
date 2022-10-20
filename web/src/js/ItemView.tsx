import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

export function ItemView(props) {
    useEffect(() => {
        document.title = 'Polymedia - Create Item';
    }, []);

    const uid = useParams().uid;

    return <div id='page'>

        <h1>ItemView</h1>

        <p>
        Viewing: {uid}
        </p>

    </div>;
}
