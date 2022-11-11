import React, { useEffect, useState } from 'react';
import { useWallet } from '@mysten/wallet-adapter-react';
import { POLYMEDIA_PACKAGE } from './lib/sui_client';

const CHAT_ID = '0xcaa6977b329e49e6c0acfbd0c3d2c4dbf7efb2bc';

export function SampleChat(props: any) {
    useEffect(() => {
        document.title = 'Polymedia - SampleChat';
        select('Ethos Wallet');
    }, []);

    const [error, setError] = useState('');
    const [maxSize, setMaxSize] = useState(3);
    const [message, setMessage] = useState('');

    const { select, signAndExecuteTransaction } = useWallet();
    const onClickCreateChat = () => {
        console.debug(`[onClickCreateChat] Calling item::create on package: ${POLYMEDIA_PACKAGE}`);
        signAndExecuteTransaction({
            kind: 'moveCall',
            data: {
                packageObjectId: POLYMEDIA_PACKAGE,
                module: 'chat',
                function: 'create',
                typeArguments: [],
                arguments: [
                    maxSize
                ],
                gasBudget: 10000,
            }
        })
        .then((resp: any) => {
            if (resp.effects.status.status == 'success') {
                console.debug('[onClickCreateChat] Success:', resp);
                const newObjId = resp.effects.created[0].reference.objectId;
                console.log(`https://explorer.devnet.sui.io/objects/${newObjId}`);
                console.log(newObjId);
            } else {
                setError(resp.effects.status.error);
            }
        })
        .catch((error: any) => {
            setError(error.message);
        });
    };
    const onSubmitAddMessage = (e: any) => {
        e.preventDefault();
        console.debug(`[onSubmitAddMessage] Calling item::add_message on package: ${POLYMEDIA_PACKAGE}`);
        signAndExecuteTransaction({
            kind: 'moveCall',
            data: {
                packageObjectId: POLYMEDIA_PACKAGE,
                module: 'chat',
                function: 'add_message',
                typeArguments: [],
                arguments: [
                    CHAT_ID,
                    message
                ],
                gasBudget: 10000,
            }
        })
        .then((resp: any) => {
            if (resp.effects.status.status == 'success') {
                console.debug('[onSubmitAddMessage] Success:', resp);
                const newObjId = resp.effects.created[0].reference.objectId;
                console.log(`https://explorer.devnet.sui.io/objects/${newObjId}`);
                console.log(newObjId);
            } else {
                setError(resp.effects.status.error);
            }
        })
        .catch((error: any) => {
            setError(error.message);
        });
    };

    return <div id='page'>

        <h1>SampleChat</h1>

        maxSize: {JSON.stringify(maxSize)} <hr/>

        <br/>
        <br/>
        <button onClick={onClickCreateChat}>CREATE</button>

        <br/>
        <br/>
        {error}

        <br/>
        <hr/>

        <form onSubmit={onSubmitAddMessage}>
            <input type='text' spellCheck='false' autoCorrect='off' autoComplete='off'
                value={message} onChange={e => setMessage(e.target.value)}
            />
            <br/>
            <button type='submit'>ADD MESSAGE</button>
        </form>


    </div>;
}
