import React, { useEffect } from 'react';

export function ItemCreate(props) {
    useEffect(() => {
        document.title = 'Polymedia - Create Item';
    }, []);

    return <section className='main'>

        <h1>ItemCreate</h1>

        <div className='editor' contenteditable='true'>
            Enter your text here
        </div>

    </section>;
}
