import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from './components/Header';
import '../css/Menu.less';

export function ChatMenu(props: any) {
    const uid = useParams().uid;

    useEffect(() => {
        document.title = `Polymedia - Chat - Menu - ${uid}`;
    }, []);

    return <div id='page'>
    <div className='menu-wrapper'>

        <Header menuPath={`/chat/${uid}`} menuTitle='BACK' />

        <div>
            <h1>MENU</h1>
            <p>
                Menu contents for {uid}
            </p>

        </div>

    </div> {/* end of .menu-wrapper */}
    </div>; // end of #page

}
