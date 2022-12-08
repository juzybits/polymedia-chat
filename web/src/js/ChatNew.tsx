import React, { useEffect, useState, SyntheticEvent } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { rpc } from './lib/sui_client';
import { ethos } from 'ethos-connect';

import { POLYMEDIA_PACKAGE } from './lib/sui_client';
import { Nav } from './components/Nav';
import '../css/New.less';

export function ChatNew(props: any) {
    const [inputName, setInputName] = useState('');
    const [inputDescription, setInputDescription] = useState('');
    const [inputMaxMsgAmount, setInputMaxMsgAmount] = useState(200);
    const [inputMaxMsgLength, setInputMaxMsgLength] = useState(500);
    const [waiting, setWaiting] = useState(false);
    const [error, setError] = useState('');

    const [notify]: any = useOutletContext();
    const { status, wallet } = ethos.useWallet();

    /* Effects */

    useEffect(() => {
        document.title = 'Polymedia - Chat - New';
    }, []);

    /* Event handlers */

    const navigate = useNavigate();
    const onSubmitCreateChat = (e: SyntheticEvent) => {
        e.preventDefault();
        const isConnected = wallet && wallet.address && status=='connected';
        if (!isConnected) {
            ethos.showSignInModal();
            return;
        }
        console.debug(`[onSubmitCreateChat] Calling item::create on package: ${POLYMEDIA_PACKAGE}`);
        wallet?.signAndExecuteTransaction({
            kind: 'moveCall',
            data: {
                packageObjectId: POLYMEDIA_PACKAGE,
                module: 'chat',
                function: 'create',
                typeArguments: [],
                arguments: [
                    inputName,
                    inputDescription,
                    inputMaxMsgAmount,
                    inputMaxMsgLength,
                ],
                gasBudget: 10000,
            }
        })
        .then((resp: any) => {
            if (resp.effects.status.status == 'success') {
                console.debug('[onSubmitCreateChat] Success:', resp);
                const newObjId = resp.effects.created[0].reference.objectId;
                notify('SUCCESS!');
                navigate('/chat/' + newObjId);
            } else {
                setError(resp.effects.status.error);
            }
        })
        .catch((error: any) => {
            setError(error.message);
        });
    };

    /* Helpers */

    /* HTML */

    return <div id='page' className='page-tool'>
    <div className='new-wrapper'>

        <Nav menuPath='/chat' menuTitle='BACK' />

        <div className='new-content'>

            <h1>NEW CHAT</h1>
            <p>
                Create your own chat room.
            </p>
            <form className='form' onSubmit={onSubmitCreateChat}>
                <div className='form-field'>
                    <label>Name</label>
                    <input value={inputName} type='text' required maxLength={60}
                        className={waiting ? 'waiting' : ''} disabled={waiting}
                        spellCheck='false' autoCorrect='off' autoComplete='off'
                        onChange={e => setInputName(e.target.value)}
                    />
                </div>
                <div className='form-field'>
                    <label>Description</label>
                    <input value={inputDescription} type='text' maxLength={1000}
                        className={waiting ? 'waiting' : ''} disabled={waiting}
                        spellCheck='false' autoCorrect='off' autoComplete='off'
                        onChange={e => setInputDescription(e.target.value)}
                    />
                </div>
                <div className='form-field'>
                    <label>History capacity (10-400 messages)</label>
                    <input value={inputMaxMsgAmount} type='text' required
                        spellCheck='false' autoCorrect='off' autoComplete='off'
                        inputMode='numeric' pattern="[0-9]*"
                        onChange={ e => setInputMaxMsgAmount( (v: any) =>
                            !e.target.value ? ''
                                : !e.target.validity.valid ? v
                                    : Number(e.target.value) ) }
                    />
                </div>
                <div className='form-field'>
                    <label>Max message length (10-1000 characters)</label>
                    <input value={inputMaxMsgLength} type='text' required
                        spellCheck='false' autoCorrect='off' autoComplete='off'
                        inputMode='numeric' pattern="[0-9]*"
                        onChange={ e => setInputMaxMsgLength( (v: any) =>
                            !e.target.value ? ''
                                : !e.target.validity.valid ? v
                                    : Number(e.target.value) ) }
                    />
                </div>
                <button type='submit' className='primary'>CREATE</button>
            </form>

            { error && <div className='error'>{error}</div> }
        </div> {/* end of .new-content */}

    </div> {/* end of .new-wrapper */}
    </div>; // end of #page

}
