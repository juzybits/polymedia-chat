import React, { useEffect, useRef, useState, SyntheticEvent } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { ethos } from 'ethos-connect';
import emojiData from '@emoji-mart/data';
import EmojiPicker from './components/EmojiPicker';

import { Nav } from './components/Nav';
import { shorten, shortenAddress, getAddressColor, getAddressEmoji } from './lib/common';
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
    const [ignoreClickOutside, setIgnoreClickOutside] = useState(true);
    const [chatInputCursor, setChatInputCursor] = useState(0);

    const [notify]: any = useOutletContext();
    const { status, wallet } = ethos.useWallet();

    const refChatInput = useRef<HTMLInputElement>(null);
    const refMessageList = useRef<HTMLDivElement>(null);
    const refChatBottom = useRef<HTMLDivElement>(null);
    const refEmojiBtn = useRef<HTMLDivElement>(null);

    /* Effects */

    /// Set things up on 1st render
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

    /// React to opening/closing emoji picker
    useEffect(() => {
        if (!showEmojiPicker) {
            setIgnoreClickOutside(true);
            focusChatInput();
            return;
        }
        setIgnoreClickOutside(false);
        // Position the emoji picker next to the emoji button
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

    const onSelectEmoji = (emoji: any) => {
        // Add the emoji to the chat input field
        const cut = refChatInput.current?.selectionStart || 0;
        setChatInput( chatInput.slice(0,cut) + emoji.native + chatInput.slice(cut) );
        setChatInputCursor(cut+2);
        setShowEmojiPicker(false);
    };

    const onclickOutsideEmojiPicker = () => {
        // hack to ignore the 1st click (in the button that opens the picker)
        if (ignoreClickOutside) {
            setIgnoreClickOutside(false);
        } else {
            setShowEmojiPicker(false);
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

    const onClickCopyAddress = (e: SyntheticEvent, address: string) => {
        e.preventDefault();
        navigator.clipboard
            .writeText(address)
            .then( () => notify('COPIED!') )
            .catch( err => notify('Error copying to clipboard') );
        focusChatInput();
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

    /// Shorten a 0x address, style it, and make it clickable
    const MagicAddress = (props: any) => {
        return <>
            <a onClick={(e) => onClickCopyAddress(e, props.address)}
               style={{color: getAddressColor(props.address, 2, true)}}
            >
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

    return <div id='page' className='page-tool'>
    <div id='chat-wrapper'>
        <Nav menuPath={`/chat/${chatId}/menu`} />
        <div className='chat-top'>
            <h1 className='chat-title'>{chatObj?.details.data.fields.name}</h1>
            <p className='chat-description'>
                {chatObj?.details.data.fields.description}
            </p>
        </div>

        <div ref={refMessageList} id='message-list' className='chat-middle'>{messages.map((msg: any, idx) =>
            <div key={idx} className='message'>
                <div className='message-pfp-wrap'>
                    <span className='message-pfp'
                          style={{background: getAddressColor(msg.author, 8)}}
                          onClick={(e) => onClickCopyAddress(e, msg.author)}
                    >
                        {getAddressEmoji(msg.author)}
                    </span>
                </div>
                <span className='message-text-wrap'>
                    <span className='message-author'>
                        <MagicAddress address={msg.author} />
                    </span>
                    <div className='message-text'>
                        <MagicText plainText={msg.text} />
                    </div>
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
                <EmojiPicker data={emojiData}
                    onEmojiSelect={onSelectEmoji}
                    onClickOutside={onclickOutsideEmojiPicker}
                    autoFocus={true}
                />
            }

        </div>

    </div> {/* end of #chat-wrapper */}

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
