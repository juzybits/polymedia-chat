import React, { useEffect } from 'react';

export function NotFound(props) {
    useEffect(() => {
        document.title = 'Polymedia - Not found';
    }, []);

    return <section className='main'>
        <h1>404</h1>
        <div>
            Not found.
        </div>
    </section>;
}
