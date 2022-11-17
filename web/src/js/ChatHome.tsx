import React, { useEffect } from 'react';

export function ChatHome(props: any) {
    useEffect(() => {
        document.title = 'Polymedia - Chat';
    }, []);

    return <div id='page'>
        <h1>ChatHome</h1>
        <div>
            Coming soon...
        </div>
    </div>;
}
