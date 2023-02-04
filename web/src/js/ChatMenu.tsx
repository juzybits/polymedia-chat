import { useEffect, useState } from 'react';
import { Link, useParams, useOutletContext } from 'react-router-dom';
import { Nav } from './components/Nav';
import { getConfig } from './lib/sui_client';
import '../css/Menu.less';

export function ChatMenu() {
    const [chatObj, setChatObj]: any = useState(null);
    const [error, setError] = useState('');

    const [_notify, network] = useOutletContext<string>();
    const [rpc, _packageId, suiFansChatId] = getConfig(network);

    let chatId = useParams().uid || '';
    const chatAlias = chatId;
    if (chatId == '@sui-fans') {
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

    return <div id='page' className='page-tool'>
    <div className='menu-wrapper'>

        <Nav menuPath={`/${chatAlias}`} menuTitle='BACK' />

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
                            <a href={'https://explorer.sui.io/object/'+chatObj.details.data.fields.id.id+'?network='+network} target='_blank'>
                                {chatObj.details.data.fields.id.id}
                            </a>
                        </span>
                    </div>
                    <div className='menu-field'>
                        <span className='menu-field-label'>Name:</span>
                        <span className='menu-field-value'>{chatObj.details.data.fields.name}</span>
                    </div>
                    <div className='menu-field'>
                        <span className='menu-field-label'>Description:</span>
                        <span className='menu-field-value'>{chatObj.details.data.fields.description}</span>
                    </div>
                    <div className='menu-field'>
                        <span className='menu-field-label'>Max messages:</span>
                        <span className='menu-field-value'>{chatObj.details.data.fields.max_msg_amount}</span>
                    </div>
                    <div className='menu-field'>
                        <span className='menu-field-label'>Max message length:</span>
                        <span className='menu-field-value'>{chatObj.details.data.fields.max_msg_length}</span>
                    </div>
                    {/*<div className='menu-field'>
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
