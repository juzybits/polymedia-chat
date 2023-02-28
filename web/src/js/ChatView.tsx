import { useEffect, useRef, useState, SyntheticEvent } from 'react';
import { Link, useParams, useOutletContext } from 'react-router-dom';
import { GetObjectDataResponse, SuiAddress, SuiObject, SuiMoveObject } from '@mysten/sui.js';
import { useWalletKit } from '@mysten/wallet-kit';
import emojiData from '@emoji-mart/data';
import { PolymediaProfile, ProfileManager } from '@polymedia/profile-sdk';

import EmojiPicker from './components/EmojiPicker';
import { Nav } from './components/Nav';
import { parseMagicText, MagicAddress } from './components/MagicText';
import { timeAgo } from './lib/common';
import { getAddressColor, getAddressEmoji } from './lib/addresses';
import { isExpectedType, getConfig } from './lib/sui_client';
import '../css/Chat.less';
import verifiedBadge from '../img/verified_badge.svg';

// Messages from these addresses will be hidden from everyone except from their authors
const bannedAddresses: string[] = [
    '0x4f7b3694ca43093a669e46209e9a15ce0bcccab8',
];

const verifiedAddresses: string[] = [
    '0x37e19fe9f6dde6161e2e042505586231c1e055c4',
    '0x4b09ce9fd4001a21d321b819c40183fa506ac5cc',
];

export const ChatView: React.FC = () =>
{
    /* Global state */
    const [notify, network, connectModalOpen, setConnectModalOpen]: any = useOutletContext();
    const [rpc, packageId, suiFansChatId] = getConfig(network);
    const { currentAccount, signAndExecuteTransaction } = useWalletKit();
    const refHasCurrentAccount = useRef(false);
    /* Polymedia Profile */
    const profileManager = new ProfileManager({network});
    const [profiles, setProfiles] = useState( new Map<SuiAddress, PolymediaProfile|null>() );
    const refProfiles = useRef(profiles);
    /* Chat messages */
    const [chatObj, setChatObj] = useState<SuiMoveObject|null>(null);
    const [messages, setMessages] = useState<object[]>([]);
    const [error, setError] = useState('');
    /* Emoji picker */
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [ignoreClickOutside, setIgnoreClickOutside] = useState(true);
    const [chatInputCursor, setChatInputCursor] = useState(0);
    /* More app state. Some need to be references because of setInterval() */
    const [isSendingMsg, setIsSendingMsg] = useState(false); // waiting for a message txn to complete
    const refIsReloadInProgress = useRef(false); // to stop reloading when reloadChat() is in progress
    const refIsScrolledUp = useRef(false); // to stop reloading the chat when the user scrolls up
    const refUserAddr = useRef(localStorage.getItem('polymedia.userAddr') || ''); // Current user. TODO: store an array
    const refUserClosedTeaser = useRef(false);
    /* References to HTML elements */
    const refChatBottom = useRef<HTMLDivElement>(null);
    const refChatInput = useRef<HTMLInputElement>(null);
    const refEmojiBtn = useRef<HTMLDivElement>(null);
    const refMessageList = useRef<HTMLDivElement>(null);

    // Handle '/@sui-fans' alias
    let chatId = useParams().uid || '';
    const chatAlias = chatId;
    if (chatId == '@sui-fans') {
        chatId = suiFansChatId;
    }

    /// Handle 1st render
    useEffect(() => {
        document.title = `Polymedia Chat - ${chatId}`;
        focusChatInput();
        reloadChat();
        /// Periodically update the list of messages
        const interval = setInterval(reloadChat, 5000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    /* Addresses and Polymedia Profile */

    // Handle wallet connect/disconnect
    useEffect(() => {
        refHasCurrentAccount.current = Boolean(currentAccount);
        if (!currentAccount) {
            return;
        }
        // Update the current address everywhere
        refUserAddr.current = currentAccount;
        localStorage.setItem('polymedia.userAddr', currentAccount)
        // Preload the current address profile so it's ready when/if the user talks
        if (!profiles.has(currentAccount)) {
            const newProfiles = new Set(profiles.keys());
            newProfiles.add(currentAccount);
            fetchProfiles(newProfiles);
        }
        focusChatInput();
    }, [currentAccount]);

    /// Re-focus on the text input after connecting, once the modal is closed
    useEffect(() => {
        if (!connectModalOpen && currentAccount) {
            focusChatInput();
        }
    }, [connectModalOpen]);

    const fetchProfiles = (authorAddresses: Set<string>) => {
        // Always include the current user address
        if (refUserAddr.current) {
            authorAddresses.add(refUserAddr.current);
        }
        profileManager.getProfiles({lookupAddresses: authorAddresses})
        .then(newProfiles => {
            setProfiles(newProfiles);
            refProfiles.current = newProfiles;
        })
        .catch((error: any) => {
            setError(`[fetchProfiles] Request error: ${error.message}`);
        })
    };

    /* Messages */

    /// Re-focus on the text input after sending a message
    useEffect(() => {
        if (!isSendingMsg && currentAccount) {
            focusChatInput();
        }
    }, [isSendingMsg]);

    /// Handle new messages
    useEffect(() => {
        // scroll to the bottom of the message list (if the user has not manually scrolled up)
        if (!refIsScrolledUp.current && refMessageList.current) {
            refMessageList.current.scrollTop = refMessageList.current.scrollHeight;
        }
    }, [messages]);

    const reloadChat = () => {
        if (refIsScrolledUp.current || refIsReloadInProgress.current) {
            return;
        }
        refIsReloadInProgress.current = true;
        rpc.getObject(chatId)
        .then((resp: GetObjectDataResponse) => {
            if (resp.status != 'Exists') {
                setError(`[reloadChat] Object does not exist. Status: ${resp.status}`);
                return;
            }
            const objData = (resp.details as SuiObject).data as SuiMoveObject;
            if (!isExpectedType(objData.type, packageId, 'chat', 'ChatRoom')) {
                setError(`[reloadChat] Wrong object type: ${objData.type}`);
            } else {
                setError('');
                setChatObj(objData);
                const userIsBanned = refUserAddr.current && bannedAddresses.includes(refUserAddr.current);
                const newMsgs = objData.fields.messages;
                const formattedMessages = [];
                const authorAddresses = new Set<string>();
                // Order messages
                const idx = Number(objData.fields.last_index);
                const sortedMessages = [ ...newMsgs.slice(idx+1), ...newMsgs.slice(0, idx+1) ];
                for (const msg of sortedMessages) {
                    // Skip messages from banned addresses (unless the user is banned)
                    if (!userIsBanned && bannedAddresses.includes(msg.fields.author))
                        continue;
                    // Extract the message fields
                    formattedMessages.push(msg.fields);
                    // Collect user addresses
                    authorAddresses.add(msg.fields.author);
                }

                // Teaser for Polymedia Profile
                if (refHasCurrentAccount.current && !refUserClosedTeaser.current) {
                    const isMissingProfile = refUserAddr.current && refProfiles.current.get(refUserAddr.current) === null;
                    isMissingProfile && formattedMessages.push({
                        author: '0x0000000000000000000000000000000000000000',
                        text: `Wake up ${refUserAddr.current}`,
                        timestamp: String(Date.now()),
                    });
                }

                // Update state
                setMessages(formattedMessages);
                fetchProfiles(authorAddresses);

                // Tweets
                // twttr && twttr.widgets.load(refMessageList.current);
            }
        })
        .catch(err => {
            setError(`[reloadChat] RPC error: ${err.message}`)
        })
        .finally(() => {
            refIsReloadInProgress.current = false;
        });
    };

    const onSubmitAddMessage = async (e: SyntheticEvent) => {
        e.preventDefault();
        setError('');
        setIsSendingMsg(true);
        // await preapproveTxns();
        console.debug(`[onSubmitAddMessage] Calling chat::add_message on package: ${packageId}`);
        signAndExecuteTransaction({
            kind: 'moveCall',
            data: {
                packageObjectId: packageId,
                module: 'chat',
                function: 'add_message',
                typeArguments: [],
                arguments: [
                    chatId,
                    String(Date.now()),
                    Array.from( (new TextEncoder()).encode( getChatInputValue() ) ),
                ],
                gasBudget: 10000,
            }
        })
        .then((resp: any) => {
            // @ts-ignore
            const effects = resp.effects.effects || resp.effects; // Suiet || Sui|Ethos
            if (effects.status.status == 'success') {
                reloadChat();
                setChatInputValue('');
            } else {
                setError(`[onSubmitAddMessage] Response error: ${effects.status.error}`);
            }
        })
        .catch((error: any) => {
            setError(`[onSubmitAddMessage] Request error: ${error.message}`);
        })
        .finally(() => {
            setIsSendingMsg(false);
        });
    };

    /* Emojis */

    /// Handle emoji picker open/close
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

    /// After inserting an emoji, focus back on the text input and restore the original cursor position.
    useEffect(() => {
        focusChatInput();
        refChatInput.current?.setSelectionRange(chatInputCursor, chatInputCursor);
    }, [chatInputCursor]);

    /// Add the emoji to the chat input field and close the picker
    const onSelectEmoji = (emoji: any) => {
        const cut = refChatInput.current?.selectionStart || 0;
        const chatInput = getChatInputValue();
        setChatInputValue( chatInput.slice(0,cut) + emoji.native + chatInput.slice(cut) );
        setChatInputCursor(cut+2);
        setShowEmojiPicker(false);
    };

    const onclickOutsideEmojiPicker = () => {
        if (ignoreClickOutside) {
            // hack to ignore the 1st click (in the button that opens the picker)
            setIgnoreClickOutside(false);
        } else {
            setShowEmojiPicker(false);
        }
    };

    /* Convenience functions */

    // Pause/resume chat autoscrolling if the user manually scrolled up
    const onScrollMessageList = () => {
        if (!refMessageList.current)
            return;
        const scrollHeight = refMessageList.current.scrollHeight; // height of contents including content not visible due to overflow (3778px)
        const clientHeight = refMessageList.current.clientHeight; // element inner height in pixels (700px)
        const scrollTop = refMessageList.current.scrollTop; // distance from the element's top to its topmost visible content (initially 3078px)
        const veryBottom = scrollHeight - clientHeight; // 3078px (max value for scrollTop, i.e. fully scrolled down)
        const isScrolledUp = veryBottom - scrollTop > 100; // still reload if slightly scrolled up (to prevent accidental pausing)
        if (isScrolledUp && !refIsScrolledUp.current) {
            refIsScrolledUp.current = true;
        } else if (!isScrolledUp && refIsScrolledUp.current) {
            refIsScrolledUp.current = false;
        }
    };

    /// Get/set the chat input through a reference, to prevent React from re-rendering
    /// everything with each key press (including the list of messages)
    const getChatInputValue = (): string => {
        return !refChatInput.current ? '' : refChatInput.current.value;
    };
    const setChatInputValue = (value: string): void => {
        if (refChatInput.current) refChatInput.current.value = value;
    };

    const focusChatInput = () => {
        refChatInput.current?.focus();
    }

    const copyAddress = (address: string) => {
        navigator.clipboard
            .writeText(address)
            .then( () => notify('COPIED!') )
            .catch( _err => notify('Error copying to clipboard') );
        focusChatInput();
    };

    /* HTML */

    const description = chatObj ? chatObj.fields.description : '';
    return <div id='page' className='page-tool'>
    <div id='chat-wrapper'>
        <Nav menuPath={`/${chatAlias}/menu`} />
        <div className='chat-top'>
            <div className='chat-title'>
               <h1 className='chat-title'>{chatObj ? chatObj.fields.name : 'Loading...'}</h1>
                { chatObj && <span className='chat-title-divider'></span> }
                <Link className='chat-description' to={`/${chatAlias}/menu`}>
                    { description.length > 70 ? description.slice(0, 70)+' ...': description }
                </Link>
            </div>
        </div>

        <div ref={refMessageList} id='message-list' className='chat-middle' onScroll={onScrollMessageList}>
        {messages.map((msg: any, idx) => {
            const isPolymediaTeaser = msg.author == '0x0000000000000000000000000000000000000000';
            const profile = isPolymediaTeaser
                ? ({
                    name: 'The Professor',
                    url: 'https://i.imgur.com/au3wKTL.jpg',
                    owner: msg.author,
                } as PolymediaProfile)
                : profiles.get(msg.author);
            let teaserButtons = <></>;
            if (isPolymediaTeaser) {
                teaserButtons = <div className='teaser-buttons'>
                    <button className='primary open-eyes' onClick={() => {
                        window.open('https://mountsogol.com?network='+network, '_self')
                    }}>Open eyes 👀</button>
                    <button className='primary' onClick={() => {
                        refUserClosedTeaser.current=true; setMessages(messages.slice(0, -1));
                    }}>Stay asleep 😴</button>
                </div>;
            }
            const hasPfpImage = profile && profile.url;
            let pfpClasses = 'message-pfp';
            const pfpStyles: any = {};
            if (hasPfpImage) {
                pfpStyles.backgroundImage = 'url('+encodeURI(profile.url)+')';
                pfpClasses += ' polymedia-profile';
            } else {
                pfpStyles.backgroundColor = getAddressColor(msg.author, 12);
            }
            const magicText = parseMagicText(profiles, msg.text, copyAddress);
            const isVerified = verifiedAddresses.includes(msg.author);
            return <div key={idx} className={`message ${currentAccount && msg.text.includes(currentAccount) ? 'highlight' : ''}`}>
                <div className='message-pfp-wrap'>
                    <span className={pfpClasses} style={pfpStyles} onClick={() => copyAddress(msg.author)}>
                        {!hasPfpImage && getAddressEmoji(msg.author)}
                    </span>
                </div>
                <span className='message-body'>
                    <span className='message-author'>
                        <MagicAddress address={msg.author} onClickAddress={copyAddress} profileName={profile && profile.name} />
                        {isVerified && <img className='verified-badge' src={verifiedBadge} />}
                    </span>
                    <span className='message-timestamp'>
                        {timeAgo(msg.timestamp)}
                    </span>
                    <div className='message-text'>
                        {magicText.text}
                    </div>
                    {magicText.images &&
                    <div className='message-images'>
                        { magicText.images.map((url, idx) => <a href={url} target='_blank' key={idx}><img src={url}/></a>) }
                    </div>}
                    {teaserButtons}
                    {/*{magicText.tweets &&
                    <div className='message-tweets'>
                        { magicText.tweets.map((url, idx) => <blockquote className='twitter-tweet' key={idx}><a href={url}></a></blockquote>) }
                    </div>}*/}
                </span>
            </div>;
        })}
        </div>

        <div ref={refChatBottom} className='chat-bottom'>
            <form onSubmit={onSubmitAddMessage} className='chat-input-wrapper'
                  onClick={currentAccount ? undefined : () => setConnectModalOpen(true)}>
                <input ref={refChatInput} type='text' required
                    maxLength={chatObj?.fields.max_msg_length}
                    className={`${isSendingMsg ? 'waiting' : (!currentAccount ? 'disabled' : '')}`}
                    disabled={!currentAccount || isSendingMsg}
                    autoCorrect='off' autoComplete='off'
                    placeholder={currentAccount ? 'Send a message' : 'Log in to send a message'}
                />
                <div ref={refEmojiBtn} id='chat-emoji-btn'
                    className={!currentAccount||isSendingMsg ? 'disabled' : ''}
                    onClick={!currentAccount||isSendingMsg ? undefined : () => { setShowEmojiPicker(!showEmojiPicker); }}
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

/* Old code */

/*
const onChangeChatInput = (e: SyntheticEvent) => {
    const text = (e.target as HTMLInputElement).value;
    setChatInputValue(text);
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
};
*/

/*
const preapproveTxns = useCallback(async () => {
    await wallet?.requestPreapproval({
        packageObjectId: packageId,
        module: 'chat',
        function: 'add_message',
        objectId: chatId,
        description: 'Send messages in this chat without having to sign every transaction.',
        maxTransactionCount: 100,
        totalGasLimit: network=='devnet' ? 100_000 : 10_000_000,
        perTransactionGasLimit: network=='devnet' ? 5_000 : 500_000,
    })
    .then(_result => {
        console.debug(`[preapproveTxns] Successfully preapproved transactions`);
    })
    .catch(err => {
        setError(`[preapproveTxns] Error requesting preapproval: ${err.message}`)
    });
}, [wallet]);
*/
