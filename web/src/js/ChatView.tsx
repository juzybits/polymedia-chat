import React, { useEffect, useRef, useState, SyntheticEvent } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { ethos } from 'ethos-connect';
import data from '@emoji-mart/data';
import EmojiPicker from './components/EmojiPicker';

import { Header } from './components/Header';
import { shorten, shortenAddress } from './lib/common';
import { POLYMEDIA_PACKAGE, rpc } from './lib/sui_client';
import '../css/Chat.less';

export function ChatView(props: any) {
    const chatId = useParams().uid || '';
    const GAS_BUDGET = 10000;

    const [error, setError] = useState('');
    const [chatInput, setChatInput] = useState('');
    const [chatObj, setChatObj]: any = useState(null);
    const [messages, setMessages] = useState([]);
    const [waiting, setWaiting] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [chatInputCursor, setChatInputCursor] = useState(0);

    const [notify] = useOutletContext();
    const { status, wallet } = ethos.useWallet();

    const refChatInput = useRef<HTMLInputElement>(null);
    const refMessageList = useRef<HTMLDivElement>(null);
    const refChatBottom = useRef<HTMLDivElement>(null);
    const refEmojiBtn = useRef<HTMLDivElement>(null);

    /* Effects */

    useEffect(() => {
        document.title = `Polymedia - Chat - ${chatId}`;
        focusChatInput();
        reloadChat();
        /// Periodically update the list of messages
        const interval = setInterval(() => { reloadChat(); }, 86_400_000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    /// Scroll to the bottom of the message list when it gets updated. TODO: improve UX.
    useEffect(() => {
        if (refMessageList.current) {
            refMessageList.current.scrollTop = refMessageList.current.scrollHeight;
        }
    }, [messages]);

    /// Position the emoji picker next to the emoji button
    useEffect(() => {
        if (!showEmojiPicker) {
            return;
        }
        const pickers = document.getElementsByTagName('em-emoji-picker') as HTMLCollectionOf<HTMLElement>;
        const emojiPicker = pickers.length ? pickers[0] : null;
        if (!emojiPicker || !refChatBottom.current) {
            return;
        }
        emojiPicker.style.right = `${refChatBottom.current.offsetLeft}px`;
        emojiPicker.style.bottom = `${refChatBottom.current.offsetHeight}px`;
    }, [showEmojiPicker]);

    // After inserting an emoji, focus back on the text input and restore the original cursor position.
    useEffect(() => {
        focusChatInput();
        refChatInput.current?.setSelectionRange(chatInputCursor, chatInputCursor);
    }, [chatInputCursor]);

    /* Event handlers */

    const onSelectEmojiAddToChatInput = (emoji: any) => {
        const cut = refChatInput.current?.selectionStart || 0;
        setChatInput( chatInput.slice(0,cut) + emoji.native + chatInput.slice(cut) );
        setChatInputCursor(cut+2);
    };

    let skipClick = showEmojiPicker;
    const onClickOutsideCloseEmojiPicker = (e: any) => {
        if (showEmojiPicker) {
            if (skipClick) { // ignore the 1st click that opens the emoji picker
                skipClick = false;
            } else {
                setShowEmojiPicker(false);
                focusChatInput();
            }
        }
    };

    const onSubmitAddMessage = (e: SyntheticEvent) => {
        e.preventDefault();
        setError('');
        // Message validation
        const forbiddenWords = ['hello', 'hallo', 'hello guys'];
        if (chatInput.length < 4 || forbiddenWords.includes(chatInput.toLowerCase()) ) {
            setError('I\'m sure you can come up with something more creative ;)');
            return;
        }
        // Send transaction
        setWaiting(true);
        console.debug(`[onSubmitAddMessage] Calling chat::add_message on package: ${POLYMEDIA_PACKAGE}`);
        wallet?.signAndExecuteTransaction({
            kind: 'moveCall',
            data: {
                packageObjectId: POLYMEDIA_PACKAGE,
                module: 'chat',
                function: 'add_message',
                typeArguments: [],
                arguments: [
                    chatId,
                    Array.from( (new TextEncoder()).encode(chatInput) ),
                ],
                gasBudget: GAS_BUDGET,
            }
        })
        .then((resp: any) => {
            if (resp.effects.status.status == 'success') {
                reloadChat();
                setChatInput('');
            } else {
                setError(resp.effects.status.error);
            }
        })
        .catch((error: any) => {
            setError(error.message);
        })
        .finally(() => {
            setWaiting(false);
        });
    };

    /* Helpers */

    const reloadChat = async () => {
        console.debug('[reloadChat] Fetching object:', chatId);
        rpc.getObject(chatId)
        .then((obj: any) => {
            if (obj.status != 'Exists') {
                setError(`[reloadChat] Object does not exist. Status: ${obj.status}`);
            } else {
                setError('');
                setChatObj(obj);
                const msgs = obj.details.data.fields.messages;
                if (msgs) {
                    setMessages( msgs.map((msg: any) => msg.fields) );
                }
            }
        })
        .catch(err => {
            setError(`[reloadChat] RPC error: ${err.message}`)
        });
    };

    const focusChatInput = () => {
        refChatInput.current?.focus();
    }

    /* Magic text (make addreses clickable, etc) */

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
        const tooltip = (message: string) => { // TODO
            console.debug('[MagicAddress] ' + message);
        };
        const onClick = (e: SyntheticEvent) => {
            e.preventDefault();
            navigator.clipboard
                .writeText(props.address)
                .then( () => tooltip('Copied!') )
                .catch( (err) => console.error(`[MagicAddress] Error copying to clipboard: ${err}`) );
            focusChatInput();
            notify('COPIED!');
        };
        return <>
            <a onClick={onClick} style={cssAuthor(props.address)}>
                {shortenAddress(props.address)}
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

    /* HTML */

    return <div id='page'>
    <div className='chat-wrapper'>
        <Header menuPath={`/chat/${chatId}/menu`} />
        <div className='chat-top'>
            <h1 className='chat-title'>{chatObj?.details.data.fields.name}</h1>
            <p className='chat-description'>
                {chatObj?.details.data.fields.description}
            </p>
        </div>

        <div ref={refMessageList} id='message-list' className='chat-middle'>{messages.map((msg: any, idx) =>
            <div key={idx} className='message'>
                <span className='message-author'>
                    <MagicAddress address={msg.author} />:
                </span>
                <span className='message-text'>
                    <MagicText plainText={msg.text} />
                </span>
            </div>
        )}
        </div>

        <div ref={refChatBottom} className='chat-bottom'>
            <form onSubmit={onSubmitAddMessage} className='chat-input-wrapper'>
                <input ref={refChatInput} type='text' required maxLength={512}
                    className={waiting ? 'waiting' : ''} disabled={waiting}
                    spellCheck='false' autoCorrect='off' autoComplete='off'
                    value={chatInput} onChange={e => setChatInput(e.target.value)}
                    placeholder='Send a message' />
                <div ref={refEmojiBtn} id='chat-emoji-btn' onClick={() => { setShowEmojiPicker(!showEmojiPicker); }}>
                    😜
                </div>
            </form>

            { error && <div className='error'>{error}</div> }

            { showEmojiPicker &&
                <EmojiPicker data={data} onEmojiSelect={onSelectEmojiAddToChatInput} onClickOutside={onClickOutsideCloseEmojiPicker} />
            }

        </div>

    </div> {/* end of .chat-wrapper */}

    </div>; // end of #page
}

/* DEV_ONLY
const onClickCreateChat = () => {
    console.debug(`[onClickCreateChat] Calling item::create on package: ${POLYMEDIA_PACKAGE}`);
    wallet?.signAndExecuteTransaction({
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
    .catch((error: any) => {
        setError(error.message);
    });
};
*/
