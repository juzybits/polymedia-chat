import React, { useEffect, useState, SyntheticEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useWallet } from '@mysten/wallet-adapter-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

import { Header } from './components/Header';
import { shorten } from './lib/common';
import { rpc } from './lib/sui_client';
import '../css/ChatView.less';

export function ChatView(props: any) {
    const uid = useParams().uid;
    const POLYMEDIA_PACKAGE = '0x5277fc5bb90ebf82fe680a80cdfb95e8b147d224';
    const CHAT_ID = '0x32895711429b47e92a67e12c70cc900230477500';
    const GAS_BUDGET = 10000;

    const [error, setError] = useState('');
    const [chatError, setChatError] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [waiting, setWaiting] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const { connected, signAndExecuteTransaction } = useWallet();

    /* Effects */

    useEffect(() => {
        document.title = `Polymedia - Chat - ${uid}`;
        focusOnChatInput();
        reloadChat();
        const interval = setInterval(() => { reloadChat(); }, 60000);
        return () => { clearInterval(interval); }
    }, []);

    useEffect(() => {
        scrollToEndOfChat();
    }, [messages]);

    useEffect(() => {
        if (showEmojiPicker) {
            placeEmojiPicker();
        }
    }, [showEmojiPicker]);

    /* Helpers */

    const reloadChat = async () => {
        console.debug('[reloadChat] Fetching object:', CHAT_ID);
        rpc.getObject(CHAT_ID)
        .then((obj: any) => {
            if (obj.status != 'Exists') {
                setError(`[reloadChat] Object does not exist. Status: ${obj.status}`);
            } else {
                setError('');
                const messages = obj.details.data.fields.messages;
                if (messages) {
                    setMessages( messages.map((msg: any) => msg.fields) );
                }
            }
        })
        .catch(err => {
            setError(`[reloadChat] RPC error: ${err.message}`)
        });
    };

    const scrollToEndOfChat = async () => {
        var div = document.getElementById('message-list');
        if (div) {
            div.scrollTop = div.scrollHeight;
        }
    };

    const focusOnChatInput = () => {
        document.getElementById('chat-input')?.focus();
    }

    const placeEmojiPicker = () => {
        const chatBottom = document.getElementById('chat-bottom');
        const emojiPicker = document.getElementsByTagName('em-emoji-picker') as HTMLCollectionOf<HTMLElement>;
        if (!chatBottom || !emojiPicker.length) {
            return;
        }
        emojiPicker[0].style.right = `${chatBottom.offsetLeft}px`;
        emojiPicker[0].style.bottom = `${chatBottom.offsetHeight}px`;
    }

    /* Event handlers */

    const onSubmitAddMessage = (e: SyntheticEvent) => {
        e.preventDefault();
        return;
        setError('');
        // Message validation
        const forbiddenWords = ['hello', 'hallo', 'hello guys'];
        if (message.length < 4 || forbiddenWords.includes(message.toLowerCase()) ) {
            setChatError(`I'm sure you can come up with something more creative ;)`);
            return;
        }
        // Send transaction
        setWaiting(true);
        console.debug(`[onSubmitAddMessage] Calling chat::add_message on package: ${POLYMEDIA_PACKAGE}`);
        signAndExecuteTransaction({
            kind: 'moveCall',
            data: {
                packageObjectId: POLYMEDIA_PACKAGE,
                module: 'chat',
                function: 'add_message',
                typeArguments: [],
                arguments: [
                    CHAT_ID,
                    Array.from( (new TextEncoder()).encode(message) ),
                ],
                gasBudget: GAS_BUDGET,
            }
        })
        .then((resp: any) => {
            if (resp.effects.status.status == 'success') {
                reloadChat();
                setMessage('');
            } else {
                setError(resp.effects.status.error);
            }
        })
        .catch(error => {
            setError(error.message);
        })
        .finally(() => {
            setWaiting(false);
        });
    };

    /* DEV_ONLY
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
                    100, // max message count
                    512, // max message length
                ],
                gasBudget: GAS_BUDGET,
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
        .catch(error => {
            setError(error.message);
        });
    };
    */

    /* Render */

    const cssAuthor = (author_address: string) => {
        let red = parseInt( author_address.slice(2, 4), 16 );
        let green = parseInt( author_address.slice(4, 6), 16 );
        let blue = parseInt( author_address.slice(6, 8), 16 );
        let min_val = 127;
        if (red < min_val)   { red   = 255 - red; }
        if (green < min_val) { green = 255 - green; }
        if (blue < min_val)  { blue  = 255 - blue; }
        return {
            color: `rgb(${red}, ${green}, ${blue})`,
        };
    };

    /// Shorten a 0x address, style it, and make it clickable
    const MagicAddress = (props: any) => {
        const tooltip = (message: string) => {
            console.debug('[MagicAddress] ' + message);
        };
        const onClick = (e: SyntheticEvent) => {
            e.preventDefault();
            focusOnChatInput();
            navigator.clipboard
                .writeText(props.address)
                .then( () => tooltip('Copied!') )
                .catch( (err) => console.error(`[MagicAddress] Error copying to clipboard: ${err}`) );
        };
        return <>
            <a onClick={onClick} style={cssAuthor(props.address)}>
                {'@' + shorten(props.address, 0, 4, '')}
            </a>
        </>;
    };

    /// Parse plaintext and format the 0x addresses in it
    const MagicText = (props: any) => {
        const addressRegex = new RegExp(/0x[a-fA-F0-9]+/g);
        const addresses = props.plainText.match(addressRegex) || [];
        const texts = props.plainText.split(addressRegex);

        let key = 0;
        const chunk = (contents: any) => {
            return <React.Fragment key={key++}>{contents}</React.Fragment>;
        };

        let result = [ chunk(texts.shift()) ];
        for (let address of addresses) {
            result.push( chunk(<MagicAddress address={address} />) );
            result.push( chunk(texts.shift()) );
        }
        return <>{result}</>;
    };

    return <div id='page'>
    <div className='chat-wrapper'>
        <Header />
        <div className='chat-top'>
            <h2 className='chat-title'>CHAT: {uid}</h2>
            <p className='chat-description'>
                <b>A message board to find other players.</b>
                <br/>
                A message board to find other players.
                <br/>
                <i>A message board to find other players.</i>
                <br/>
                <br/>
                <i>Pro tip #1: click an address to copy it.</i>
                <br/>
                <i>Pro tip #2: paste an address to link it.</i>
                <br/>
                <br/>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
        </div>

        <div id='message-list' className='chat-middle'>{messages.map((msg: any, idx) =>
            <div key={idx} className='message'>
                <MagicAddress address={msg.author} />: <MagicText plainText={msg.text} />
            </div>
        )}
        </div>

        <div id='chat-bottom'>
            <form onSubmit={onSubmitAddMessage} className='chat-input-wrapper'>
                <input id='chat-input' type='text' required maxLength={512}
                    className={`nes-input ${waiting ? 'is-disabled' : ''}`} disabled={waiting}
                    spellCheck='false' autoCorrect='off' autoComplete='off'
                    value={message} onChange={e => setMessage(e.target.value)}
                    placeholder='Send a message' />
                    {chatError &&
                        <i className='nes-text is-error' style={{fontSize: '0.8em'}}>{chatError}</i>
                    }

                <div id='chat-emoji-button' onClick={() => { setShowEmojiPicker(!showEmojiPicker); }}>
                    😜
                </div>
            </form>

            { error && <><br/>ERROR:<br/>{error}</> }
        </div>

        { showEmojiPicker && <Picker data={data} onEmojiSelect={console.log} /> }
    </div> {/* end of .chat-wrapper */}

    </div>; // end of #page
}
