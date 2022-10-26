import React, { useEffect, useState } from 'react';
import { createItem } from './lib/sui_client';

export function ItemCreate(props: any) {
    useEffect(() => {
        document.title = 'Polymedia - Create Item';

        fillPost();
    }, []);

    const [error, setError] = useState('');

    const [kind, setKind] = useState('');
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

    const onClickCreateItem = () => {
        createItem(
            kind,
            version,
            name,
            text,
            url,
            data,
        )
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
        .catch(error => {
            setError(error.message);
        });
    };


    return <div id='page'>

        <h1>ItemCreate</h1>

        kind: {JSON.stringify(kind)} <hr/>
        version: {JSON.stringify(version)} <hr/>
        name: {JSON.stringify(name)} <hr/>
        text: {JSON.stringify(text)} <hr/>
        url: {JSON.stringify(url)} <hr/>
        data: {JSON.stringify(data)} <hr/>

        <br/>
        <br/>
        <button onClick={onClickCreateItem}>CREATE</button>

    </div>;
}
