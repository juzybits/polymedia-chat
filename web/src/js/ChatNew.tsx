import React, { useEffect, useState, SyntheticEvent } from 'react';
import { Nav } from './components/Nav';
import { rpc } from './lib/sui_client';
import '../css/New.less';

export function ChatNew(props: any) {
    const [inputName, setInputName] = useState('');
    const [inputDescription, setInputDescription] = useState('');
    const [inputMaxMsgAmount, setInputMaxMsgAmount] = useState(100);
    const [inputMaxMsgLength, setInputMaxMsgLength] = useState(500);
    const [waiting, setWaiting] = useState(false);
    const [error, setError] = useState('');

    /* Effects */

    useEffect(() => {
        document.title = 'Polymedia - Chat - New';
    }, []);

    /* Event handlers */

    const onSubmitCreateChat = (e: SyntheticEvent) => {
        e.preventDefault();
        setError('');
        // TODO: validate form
        // TODO: submit form
    };

    /* Helpers */

    /* HTML */

    return <div id='page' className='page-tool'>
    <div className='new-wrapper'>

        <Nav menuPath='/chat' menuTitle='BACK' />

        <div className='new-content'>

            <h1>NEW CHAT</h1>

            <form onSubmit={onSubmitCreateChat}>
                <div className='new-field'>
                    <label>Name:</label>
                    <input value={inputName} type='text' required maxLength={60}
                        className={waiting ? 'waiting' : ''} disabled={waiting}
                        spellCheck='false' autoCorrect='off' autoComplete='off'
                        onChange={e => setInputName(e.target.value)}
                    />
                </div>
                <div className='new-field'>
                    <label>Description:</label>
                    <input value={inputDescription} type='text' required maxLength={500}
                        className={waiting ? 'waiting' : ''} disabled={waiting}
                        spellCheck='false' autoCorrect='off' autoComplete='off'
                        onChange={e => setInputDescription(e.target.value)}
                    />
                </div>
                <div className='new-field'>
                    <label>Max amount of messages (10-200)</label>
                    <input value={inputMaxMsgAmount} type='text' required
                        spellCheck='false' autoCorrect='off' autoComplete='off'
                        inputMode='numeric' pattern="[0-9]*"
                        onChange={e =>
                            setInputMaxMsgAmount(v => (e.target.validity.valid ? Number(e.target.value) : v))
                        }
                    />
                </div>
                <div className='new-field'>
                    <label>Max message length (10-1000):</label>
                    <input value={inputMaxMsgLength} type='text' required
                        spellCheck='false' autoCorrect='off' autoComplete='off'
                        inputMode='numeric' pattern="[0-9]*"
                        onChange={e =>
                            setInputMaxMsgLength(v => (e.target.validity.valid ? Number(e.target.value) : v))
                        }
                    />
                </div>
                <button type='submit' className='primary'>SUBMIT</button>
            </form>

        </div>

    </div> {/* end of .new-wrapper */}
    </div>; // end of #page

}
