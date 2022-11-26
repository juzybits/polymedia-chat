import React, { useEffect, useRef, useState, useCallback, SyntheticEvent } from 'react';
import { Link, useParams, useOutletContext } from 'react-router-dom';
import { ethos } from 'ethos-connect';
import emojiData from '@emoji-mart/data';

import EmojiPicker from './components/EmojiPicker';
import { Nav } from './components/Nav';
import { timeAgo } from './lib/common';
import { isTrustedDomain } from './lib/domains';
import { shortenAddress, getAddressColor, getAddressEmoji } from './lib/addresses';
import { POLYMEDIA_PACKAGE, rpc, isExpectedType } from './lib/sui_client';
import '../css/Chat.less';

export function ChatView(props: any) {
    const chatId = useParams().uid || '';

    const [error, setError] = useState('');
    const [chatInput, setChatInput] = useState('');
    const [chatObj, setChatObj]: any = useState(null);
    const [messages, setMessages] = useState([]);
    const [waiting, setWaiting] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [ignoreClickOutside, setIgnoreClickOutside] = useState(true);
    const [chatInputCursor, setChatInputCursor] = useState(0);
    const [pauseScroll, setPauseScroll] = useState(false);

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
        const interval = setInterval(reloadChat, 5000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    /// Scroll to the bottom of the message list when it gets updated.
    useEffect(() => {
        if (!pauseScroll && refMessageList.current) {
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

    // Manage chat input focus
    const isConnected = wallet && wallet.address && status=='connected';
    useEffect(() => {
        if (isConnected && !waiting) {
            focusChatInput();
        }
    }, [isConnected, waiting]);

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

    const onSubmitAddMessage = async (e: SyntheticEvent) => {
        e.preventDefault();
        setError('');
        const input = chatInput.trim();
        // Message validation
        const forbiddenWords = ['hello', 'hallo', 'morning'];
        if (input.length < 3 || forbiddenWords.includes(input.toLowerCase()) ) {
            setError('I\'m sure you can come up with something more creative ;)');
            return;
        }
        await preapproveTxns();
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
                    Date.now(),
                    Array.from( (new TextEncoder()).encode(input) ),
                ],
                gasBudget: 10000,
            }
        })
        .then((resp: any) => {
            if (resp.effects.status.status == 'success') {
                reloadChat();
                setChatInput('');
            } else {
                setError(`[onSubmitAddMessage] Response error: ${resp.effects.status.error}`);
            }
        })
        .catch((error: any) => {
            setError(`[onSubmitAddMessage] Request error: ${error.message}`);
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

    // Pause/resume chat autoscrolling if the user manually scrolled up
    const onScrollMessageList = (e: SyntheticEvent) => {
        if (!refMessageList.current)
            return;
        const scrollHeight = refMessageList.current.scrollHeight; // height of contents including content not visible due to overflow (3778px)
        const clientHeight = refMessageList.current.clientHeight; // element inner height in pixels (700px)
        const scrollTop = refMessageList.current.scrollTop; // distance from the element's top to its topmost visible content (initially 3078px)
        const veryBottom = scrollHeight - clientHeight; // 3078px (max value for scrollTop, i.e. fully scrolled down)
        const isScrolledUp = veryBottom - scrollTop > 100; // still reload if slightly scrolled up (to prevent accidental pausing)
        if (isScrolledUp && !pauseScroll) {
            setPauseScroll(true);
        } else if (!isScrolledUp && pauseScroll) {
            setPauseScroll(false);
        }
    };

    const onChangeChatInput = (e: SyntheticEvent) => {
        const text = (e.target as HTMLInputElement).value;
        setChatInput(text);
        /*
        // Detect emoji shortcut ':ab' and open emoji picker
        const cursor = refChatInput.current?.selectionStart || 0;
        console.log('cursor', cursor);
        if (cursor < 3) {
            return;
        }
        const potentialEmojiShortcut = text.slice(0, cursor);
        console.log('potentialEmojiShortcut', potentialEmojiShortcut);

        const regexEmojiOpen = new RegExp(/:[a-z]{2,}$/);
        const match = potentialEmojiShortcut.match(regexEmojiOpen);
        console.log('match', match);
        if (match) {
            setShowEmojiPicker(true);
        }
        */
    };

    /* Helpers */

    const reloadChat = () => {
        console.debug('[reloadChat] Fetching object:', chatId);
        rpc.getObject(chatId)
        .then((obj: any) => {
            if (obj.status != 'Exists') {
                setError(`[reloadChat] Object does not exist. Status: ${obj.status}`);
            } else if (!isExpectedType(obj.details.data.type, POLYMEDIA_PACKAGE, 'chat', 'ChatRoom')) {
                setError(`[reloadChat] Wrong object type: ${obj.details.data.type}`);
            } else {
                setError('');
                setChatObj((oldObj: any) => {
                    const areEqual = oldObj?.details.previousTransaction == obj.details.previousTransaction;
                    return areEqual ? oldObj : obj;
                });
                const newMsgs = obj.details.data.fields.messages;
                newMsgs && setMessages((oldMsgs: any) => {
                    const oldLast = !oldMsgs ? null : oldMsgs[oldMsgs.length-1];
                    const newLast = newMsgs[newMsgs.length-1].fields;
                    const areEqual = oldLast &&
                        oldLast.timestamp == newLast.timestamp &&
                        oldLast.text == newLast.text &&
                        oldLast.author == newLast.author;
                    return areEqual ? oldMsgs : newMsgs.map((msg: any) => msg.fields);
                });
            }
        })
        .catch(err => {
            setError(`[reloadChat] RPC error: ${err.message}`)
        });
    };

    const focusChatInput = () => {
        refChatInput.current?.focus();
    }

    const preapproveTxns = useCallback(async () => {
        await wallet?.requestPreapproval({
            packageObjectId: POLYMEDIA_PACKAGE,
            module: 'chat',
            function: 'add_message',
            objectId: chatId,
            description: 'Send messages in this chat without having to sign every transaction.',
            maxTransactionCount: 25,
            totalGasLimit: 250_000,
            perTransactionGasLimit: 10_000,
        })
        .then((result: any) => {
            const preapproval = result;
            console.debug(`[preapproveTxns] Successfully preapproved transactions`);
        })
        .catch(err => {
            setError(`[preapproveTxns] Error requesting preapproval: ${err.message}`)
            const preapproval = null;
        });
    }, [wallet]);

    /* Magic text (make addreses clickable, etc) */

    /// Shorten a 0x address, style it, and make it clickable
    const MagicAddress = (props: any) => {
        return <a onClick={(e) => onClickCopyAddress(e, props.address)}
            style={{color: getAddressColor(props.address, 2, true)}} >
            {shortenAddress(props.address)}
        </a>;
    };

    const MagicLink = (props: any) => {
        return isTrustedDomain(props.href)
            ? <a href={props.href} target='_blank'>{props.href}</a>
            : props.href;
    };

    /// Parse plaintext and format any URLs and 0x addresses in it
    const MagicText = (props: any) =>
    {
        let key = 0;
        const chunk = (contents: any) => {
            return <React.Fragment key={key++}>{contents}</React.Fragment>;
        };

        const ReplaceAddresses = (props: any) => {
            const addressRegex = new RegExp(/0x[a-fA-F0-9]{40}/g);
            const addresses = props.plainText.match(addressRegex) || [];
            const nonAddresses = props.plainText.split(addressRegex);

            let result = [ chunk(nonAddresses.shift()) ];
            for (let address of addresses) {
                result.push( chunk(<MagicAddress address={address} />) );
                result.push( chunk(nonAddresses.shift()) );
            }
            return <>{result}</>;
        };

        const ReplaceUrls = (props: any) => {
            const urlRegex = new RegExp(/(?:https?|ipfs):\/\/[^\s]+\.[^\s]+/g);
            const urls = props.plainText.match(urlRegex) || [];
            const nonUrls = props.plainText.split(urlRegex);

            let result = [ chunk(<ReplaceAddresses plainText={nonUrls.shift()} />) ];
            for (let url of urls) {
                result.push( chunk(<MagicLink href={url} text={url} />) );
                result.push( chunk(<ReplaceAddresses plainText={nonUrls.shift()} />) );
            }
            return <>{result}</>;
        };

        return <ReplaceUrls plainText={props.plainText} />;
    };

    /* HTML */

    const description = chatObj ? chatObj.details.data.fields.description : '';
    return <div id='page' className='page-tool'>
    <div id='chat-wrapper'>
        <Nav menuPath={`/chat/${chatId}/menu`} />
        <div className='chat-top'>
            <div className='chat-title'>
               <h1 className='chat-title'>{chatObj?.details.data.fields.name}</h1>
                { chatObj && <span className='chat-title-divider'></span> }
                <Link className='chat-description' to={`/chat/${chatId}/menu`}>
                    { description.length > 70 ? description.slice(0, 70)+' ...': description }
                </Link>
            </div>
        </div>

        <div ref={refMessageList} id='message-list' className='chat-middle' onScroll={onScrollMessageList}>
        {messages.map((msg: any, idx) =>
            <div key={idx} className={`message ${isConnected && msg.text.includes(wallet.address) ? 'highlight' : ''}`}>
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
                    <span className='message-timestamp'>
                        {timeAgo(msg.timestamp)}
                    </span>
                    <div className='message-text'>
                        <MagicText plainText={msg.text} />
                    </div>
                </span>
            </div>
        )}
        </div>

        <div ref={refChatBottom} className='chat-bottom'>
            <form onSubmit={onSubmitAddMessage} className='chat-input-wrapper'
                  onClick={(isConnected ? undefined : ethos.showSignInModal)}>
                <input ref={refChatInput} type='text' required
                    maxLength={chatObj?.details.data.fields.max_msg_length}
                    className={`${waiting ? 'waiting' : (!isConnected ? 'disabled' : '')}`}
                    disabled={!isConnected || waiting}
                    spellCheck='false' autoCorrect='off' autoComplete='off'
                    placeholder={isConnected ? 'Send a message' : 'Log in to send a message'}
                    value={chatInput}
                    onChange={onChangeChatInput}
                />
                <div ref={refEmojiBtn} id='chat-emoji-btn'
                    className={isConnected ? '' : 'disabled'}
                    onClick={!isConnected ? undefined : () => { setShowEmojiPicker(!showEmojiPicker); }}
                 >
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
