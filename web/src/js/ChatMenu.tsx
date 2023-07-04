import { useEffect, useState } from 'react';
import { Link, useParams, useOutletContext } from 'react-router-dom';
import { SuiMoveObject } from '@mysten/sui.js';
import { linkToExplorer } from '@polymedia/webutils';

import { AppContext } from './App';
import { Nav } from './components/Nav';
import { getConfig } from './lib/chat';
import '../css/Menu.less';

export function ChatMenu() {
    const [chatObj, setChatObj] = useState<SuiMoveObject|null>(null);
    const [error, setError] = useState('');

    const { network, rpcProvider } = useOutletContext<AppContext>();
    const { suiFansChatId } = getConfig(network);

    let chatId = useParams().uid || '';
    const chatAlias = chatId;
    if (chatAlias == '@sui-fans') {
        chatId = suiFansChatId;
    }

    /* Effects */

    useEffect(() => {
        document.title = `Polymedia Chat - Menu - ${chatId}`;
        loadObject();
    }, []);

    /* Helpers */

    const loadObject = async () => {
        console.debug('[loadObject] Fetching object:', chatId);
        rpcProvider.getObject({
            id: chatId,
            options: {
                showContent: true,
            },
        })
        .then(resp => {
            if (resp.error) {
                setError('[loadObject] Error loading chat room: ' + JSON.stringify(resp.error));
            } else if (!resp.data) {
                setError('[loadObject] UNEXPECTED Missing object data. resp: ' + JSON.stringify(resp));
            } else {
                setError('');
                setChatObj(resp.data.content as SuiMoveObject);
            }
        })
        .catch(err => {
            setError(`[loadObject] RPC error: ${err.message}`)
        });
    };

    /* HTML */

    return <div id='page' className='page-tool'>
    <div className='menu-wrapper'>

        <Nav network={network} menuPath={`/${chatAlias}`} menuTitle='BACK' />

        <div className='menu-content'>

            <h1>CHAT DETAILS</h1>
            {
                error
            ?
                <div className='error'>
                    { error && <>ERROR:<br/>{error}</> }
                </div>
            : (
                !chatObj
                ? <div><br/>Loading...</div>
                : <>
                <div className='menu-section'>
                    <div className='menu-field'>
                        <span className='menu-field-label'>Object ID:</span>
                        <span className='menu-field-value'>
                            <a href={linkToExplorer(network, 'object', chatObj.fields.id.id)} target='_blank' rel='noopener'>
                                {chatObj.fields.id.id}
                            </a>
                        </span>
                    </div>
                    <div className='menu-field'>
                        <span className='menu-field-label'>Name:</span>
                        <span className='menu-field-value'>{chatObj.fields.name}</span>
                    </div>
                    <div className='menu-field'>
                        <span className='menu-field-label'>Description:</span>
                        <span className='menu-field-value'>{chatObj.fields.description}</span>
                    </div>
                    {/*<div className='menu-field'>
                        <span className='menu-field-label'>Max messages:</span>
                        <span className='menu-field-value'>{chatObj.fields.max_msg_amount}</span>
                    </div>
                    <div className='menu-field'>
                        <span className='menu-field-label'>Max message length:</span>
                        <span className='menu-field-value'>{chatObj.fields.max_msg_length}</span>
                    </div>
                    <div className='menu-field'>
                        <span className='menu-field-label'>Version:</span>
                        <span className='menu-field-value'>{chatObj.details.reference.version}</span>
                    </div>*/}
                </div>

                <div className='menu-section menu-buttons'>
                    <Link className='btn primary' to={`/${chatAlias}`}>BACK</Link>
                    <Link className='btn primary' to='/'>HOME</Link>
                </div>

                </>
            )
            }
        </div>

    </div> {/* end of .menu-wrapper */}
    </div>; // end of #page

}
