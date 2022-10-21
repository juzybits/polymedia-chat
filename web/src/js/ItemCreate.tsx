import React, { useEffect } from 'react';

export function ItemCreate(props: any) {
    useEffect(() => {
        document.title = 'Polymedia - Create Item';
    }, []);

    return <div id='page'>

        <h1>ItemCreate</h1>

        <div className='editor' contentEditable='true'>
            Enter your text here
        </div>

    </div>;
}
