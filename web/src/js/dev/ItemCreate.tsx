import React, { useEffect, useState } from 'react';
import { ethos } from 'ethos-connect';
import { POLYMEDIA_PACKAGE, getItems } from '../lib/sui_client';

export function ItemCreate(props: any) {
    useEffect(() => {
        document.title = 'Polymedia - Create Item';
        fillPost();
    }, []);

    const [error, setError] = useState('');

    const [kind, setKind] = useState('');
    const [account, setAccount] = useState('0x0000000000000000000000000000000000000000');
    const [version, setVersion] = useState('');
    const [name, setName] = useState('');
    const [text, setText] = useState('');
    const [url, setUrl] = useState('');
    const [data, setData] = useState('');

    const fillPost = () => {
        setKind('post');
        setVersion('0.0.1');
        setName('My 1st post');
        setText('The text of my 1st post');
        setUrl('https://github.com/juzybits');
        setData(JSON.stringify({
            "key1":
            {
                "subkey1":
                [
                    "value1",
                    "value2"
                ]
            },
            "key2": null,
            "key3": 777
        }));
    };

    const { wallet } = ethos.useWallet();
    const onClickCreateItem = () => {
        console.debug(`[onClickCreateItem] Calling item::create on package: ${POLYMEDIA_PACKAGE}`);
        wallet?.signAndExecuteTransaction({
            kind: 'moveCall',
            data: {
                packageObjectId: POLYMEDIA_PACKAGE,
                module: 'item',
                function: 'create',
                typeArguments: [],
                arguments: [
                    stringToIntArray(kind),
                    '0x0000000000000000000000000000000000000000',
                    stringToIntArray(version),
                    stringToIntArray(name),
                    stringToIntArray(text),
                    stringToIntArray(url),
                    stringToIntArray(data),
                ],
                gasBudget: 10000,
            }
        })
        .then((resp: any) => {
            if (resp.effects.status.status == 'success') {
                console.debug('[onClickCreateItem] Success:', resp);
                const newObjId = resp.effects.created[0].reference.objectId;
                console.log(`https://explorer.devnet.sui.io/objects/${newObjId}`);
                console.log(newObjId);
                getItems([newObjId]).then(items=>console.log(items[0]))
            } else {
                setError(resp.effects.status.error);
            }
        })
        .catch((error: any) => {
            setError(error.message);
        });
    };

    return <div id='page' className='page-tool'>

        <h1>ItemCreate</h1>

        kind: {JSON.stringify(kind)} <hr/>
        account: {JSON.stringify(account)} <hr/>
        version: {JSON.stringify(version)} <hr/>
        name: {JSON.stringify(name)} <hr/>
        text: {JSON.stringify(text)} <hr/>
        url: {JSON.stringify(url)} <hr/>
        data: {JSON.stringify(data)} <hr/>

        <br/>
        <br/>
        <button onClick={onClickCreateItem}>CREATE</button>

        <br/>
        <br/>
        {error}

    </div>;
}

/* Helpers */

function stringToIntArray(text: string): number[] {
    const encoder = new TextEncoder();
    return Array.from( encoder.encode(text) );
}
