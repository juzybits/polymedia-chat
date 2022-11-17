import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from './components/Header';
import { rpc } from './lib/sui_client';
import { shorten } from './lib/common';
import '../css/Menu.less';

export function ChatMenu(props: any) {
    const chatId = useParams().uid || '';
    const [chatObj, setChatObj]: any = useState(null);
    const [error, setError] = useState('');

    /* Effects */

    useEffect(() => {
        document.title = `Polymedia - Chat - Menu - ${chatId}`;
        loadObject();
    }, []);

    /* Helpers */

    const loadObject = async () => {
        console.debug('[loadObject] Fetching object:', chatId);
        rpc.getObject(chatId)
        .then((obj: any) => {
            if (obj.status != 'Exists') {
                setError(`[loadObject] Object does not exist. Status: ${obj.status}`);
            } else {
                setError('');
                setChatObj(obj);
            }
        })
        .catch(err => {
            setError(`[loadObject] RPC error: ${err.message}`)
        });
    };

    /* HTML */

    return <div id='page'>
    <div className='menu-wrapper'>

        <Header menuPath={`/chat/${chatId}`} menuTitle='BACK' />

        <div className='menu-content'>

            <h1>CHAT DETAILS</h1>
            {
                error
            ?
                <div className='error'>
                    { error && <>ERROR:<br/>{error}</> }
                </div>
            :
                <>

                <div className='menu-section'>
                    <div className='menu-field'>
                        <span className='menu-field-label'>Object ID:</span>
                        <span className='menu-field-value'>
                            <a href={'https://explorer.devnet.sui.io/objects/'+chatObj?.details.data.fields.id.id} target='_blank'>
                                {chatObj?.details.data.fields.id.id}
                            </a>
                        </span>
                    </div>
                    <div className='menu-field'>
                        <span className='menu-field-label'>Name:</span>
                        <span className='menu-field-value'>{chatObj?.details.data.fields.name}</span>
                    </div>
                    <div className='menu-field'>
                        <span className='menu-field-label'>Description:</span>
                        <span className='menu-field-value'>{chatObj?.details.data.fields.description}</span>
                    </div>
                    <div className='menu-field'>
                        <span className='menu-field-label'>Max messages:</span>
                        <span className='menu-field-value'>{chatObj?.details.data.fields.max_msg_amount}</span>
                    </div>
                    <div className='menu-field'>
                        <span className='menu-field-label'>Max message length:</span>
                        <span className='menu-field-value'>{chatObj?.details.data.fields.max_msg_length}</span>
                    </div>
                    {/*<div className='menu-field'>
                        <span className='menu-field-label'>Version:</span>
                        <span className='menu-field-value'>{chatObj?.details.reference.version}</span>
                    </div>*/}
                </div>

                <div className='menu-section'>
                    <h1>CREATE CHAT</h1>
                    <p>
                        Start your own chat room now. It's very simple!
                    </p>
                    <Link className='btn primary' to='/chat/new'>CREATE</Link>
                </div>

                <div className='menu-section'>
                    <h1>EXPLORE CHATS</h1>
                    <p>
                        Find out what else people are talking about.
                    </p>
                    <Link className='btn primary' to='/chat'>EXPLORE</Link>
                </div>

                </>
            }
        </div>

    </div> {/* end of .menu-wrapper */}
    </div>; // end of #page

}
