import React, { useEffect } from 'react';

export function ItemCreate(props) {
    useEffect(() => {
        document.title = 'Polymedia - Create Item';
    }, []);

    return <div id='page'>

        <h1>ItemCreate</h1>

        <div className='editor' contenteditable='true'>
            Enter your text here
        </div>

    </div>;
}
