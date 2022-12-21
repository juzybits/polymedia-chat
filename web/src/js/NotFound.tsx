import React, { useEffect } from 'react';

export function NotFound(props: any) {
    useEffect(() => {
        document.title = 'Polymedia Chat - Not found';
    }, []);

    return <div id='page' className='page-tool'>
        <h1>404</h1>
        <div>
            Not found.
        </div>
    </div>;
}
