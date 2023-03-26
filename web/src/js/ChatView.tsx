import { useEffect, useRef, useState, SyntheticEvent } from 'react';
import { Link, useLocation, useParams, useOutletContext } from 'react-router-dom';
import { GetObjectDataResponse, SuiAddress, SuiEventEnvelope, SuiObject, SuiMoveObject, TransactionDigest } from '@mysten/sui.js';
import { useWalletKit } from '@mysten/wallet-kit';
// import FingerprintJS from '@fingerprintjs/fingerprintjs'
import emojiData from '@emoji-mart/data';
import { PolymediaProfile, ProfileManager } from '@polymedia/profile-sdk';

import EmojiPicker from './components/EmojiPicker';
import { Nav } from './components/Nav';
import { parseMagicText, MagicAddress } from './components/MagicText';
import { timeAgo } from './lib/common';
import { getAddressColor, getAddressEmoji } from './lib/addresses';
import { getConfig } from './lib/chat';
import '../css/Chat.less';
import verifiedBadge from '../img/verified_badge.svg';

const RESUBSCRIBE_ATTEMPT_INTERVAL = 1000; // How often resubscribeToEvents() is called
const RESUBSCRIBE_MINIMUM_ELAPSED_TIME = 21000; // How often resubscribeToEvents() actually resubscribe
const PULL_RECENT_INTERVAL = 10000; // How often to pull recent messages
const MAX_MESSAGES = 500;
const SEND_MESSAGE_GAS_BUDGET = 10000;

type Message = {
    author: SuiAddress,
    text: string,
    timestamp: number,
};

// Messages from these addresses will be hidden from everyone except from their authors
const bannedAddresses: string[] = [
];

// const bannedFingerprints: string[] = [
// ];

// Shows checkmark
const verifiedAddresses: string[] = [
    '0x0e3a1382a557072bf3f0ae2c288e2c933b41efb6', // Suiet
    '0xb8e9b348974f902eb0f555dc410780650b3d990d', // Ethos
];

// To fight spammers
// const fpPromise = FingerprintJS.load({monitoring: false});

export const ChatView: React.FC = () =>
{
    /* Global state */
    const [notify, network, connectModalOpen, setConnectModalOpen]: any = useOutletContext();
    const { rpc, rpcWebsocket, polymediaPackageId, polymediaPackageIdSpecial,
            suiFansChatId, suiFansChatIdSpecial } = getConfig(network);
    const { currentAccount, signAndExecuteTransaction } = useWalletKit();
    /* User and Polymedia Profile */
    const profileManager = new ProfileManager({network});
    const refProfiles = useRef( new Map<SuiAddress, PolymediaProfile|null>() );
    const refHasCurrentAccount = useRef(false);
    const refLastUserAddr = useRef(localStorage.getItem('polymedia.userAddr') || ''); // MAYBE: store an array
    const [showProfileCTA, setShowProfileCTA] = useState(false);
    const refUserClosedProfileCTA = useRef(false);
    // const refUserClosedTeaser = useRef(false);
    /* Chat messages */
    const [chatObj, setChatObj] = useState<SuiMoveObject|null>(null);
    const [messages, setMessages] = useState(new Map<TransactionDigest, Message>);
    const [isSendingMsg, setIsSendingMsg] = useState(false); // waiting for a message txn to complete
    const refMessages = useRef(messages);
    /* Reloading */
    const refEventSubscriptionId = useRef(0);
    const refResubscribeIntervalId = useRef<ReturnType<typeof setInterval>|null>(null);
    const refIsResubscribeOngoing = useRef(false);
    const refLastResubscribeTime = useRef(0);
    const refPullRecentIntervalId = useRef<ReturnType<typeof setInterval>|null>(null);
    const refIsPullRecentOngoing = useRef(false);
    /* Emoji picker */
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [ignoreClickOutside, setIgnoreClickOutside] = useState(true);
    const [chatInputCursor, setChatInputCursor] = useState(0);
    /* UI state, and references to HTML elements */
    const [uiError, setUIError] = useState('');
    const refIsScrolledUp = useRef(false); // to stop reloading the chat when the user scrolls up
    const refChatBottom = useRef<HTMLDivElement>(null);
    const refChatInput = useRef<HTMLInputElement>(null);
    const refEmojiBtn = useRef<HTMLDivElement>(null);
    const refMessageList = useRef<HTMLDivElement>(null);

    // const refUserFingerprint = useRef('');

    /* User moderation */
    // const calcUserFingerprint = async () => {
    //     refUserFingerprint.current = await fpPromise
    //         .then(fp => fp.get())
    //         .then(result => result.visitorId);
    //     if (bannedFingerprints.includes(refUserFingerprint.current)) {
    //         localStorage.setItem('polymedia.special', '1');
    //     }
    // };
    const isBannedUser = () => {
        return (localStorage.getItem('polymedia.special') === '1')
            || (refLastUserAddr.current && bannedAddresses.includes(refLastUserAddr.current));
    };

    const packageId = isBannedUser() ? polymediaPackageIdSpecial : polymediaPackageId;

    // Handle '/@sui-fans' alias
    let chatId = useParams().uid || '';
    const chatAlias = chatId;
    if (chatId == '@sui-fans') {
        chatId = isBannedUser() ? suiFansChatIdSpecial : suiFansChatId;
    }

    /// Handle 1st render
    useEffect(() => {
        document.title = `Polymedia Chat - ${chatId}`;
        focusChatInput();
        // calcUserFingerprint();
        loadChatRoom();
        return () => {
            unloadChatRoom();
        }
    }, []);

    /* Addresses and Polymedia Profile */

    // Handle wallet connect/disconnect
    useEffect(() => {
        refHasCurrentAccount.current = Boolean(currentAccount);
        if (!currentAccount) {
            setShowProfileCTA(false);
            return;
        }
        // Update the user address everywhere
        refLastUserAddr.current = currentAccount;
        localStorage.setItem('polymedia.userAddr', currentAccount);

        focusChatInput();
        maybeShowProfileCTA();
    }, [currentAccount]);

    /// Re-focus on the text input after connecting, once the modal is closed
    useEffect(() => {
        if (!connectModalOpen && currentAccount) {
            focusChatInput();
        }
    }, [connectModalOpen]);

    // Show 'create profile' call to action if the user doesn't have a Polymedia Profile
    const maybeShowProfileCTA = () => {
        if (refHasCurrentAccount.current
            && !refUserClosedProfileCTA.current
            && refProfiles.current.get(refLastUserAddr.current) === null
        ) {
            setShowProfileCTA(true);
        }
    };

    const fetchProfiles = (authors: Set<SuiAddress>) => {
        let newAuthors = new Set<SuiAddress>();
        for (const author of authors) {
            if (!refProfiles.current.has(author)) {
                newAuthors.add(author);
            }
        }
        // Look up the current address to make sure the profile is ready when the user talks
        if (refLastUserAddr.current && !refProfiles.current.has(refLastUserAddr.current)) {
            newAuthors.add(refLastUserAddr.current);
        }
        if (!newAuthors.size) {
            console.debug('[fetchProfiles] No new authors. Skipping.');
            return;
        }
        console.debug(`[fetchProfiles] Looking up ${newAuthors.size} new authors`);
        profileManager.getProfiles({lookupAddresses: newAuthors})
        .then(newProfiles => {
            for (const [address, profile] of newProfiles.entries()) {
                refProfiles.current.set(address, profile);
            }
            setMessages(new Map(refMessages.current));
            maybeShowProfileCTA();
        })
        .catch((err) => {
            const errMsg = `[fetchProfiles] Request error: ${err.message}`;
            console.warn(errMsg);
            // setUIError(errMsg);
        })
    };

    /* Messages */

    const location = useLocation();
    const loadChatRoom = async () =>
    {
        // Pull the ChatRoom object
        try {
            const resp: GetObjectDataResponse = await rpc.getObject(chatId);
            if (resp.status != 'Exists') {
                if (location.state && location.state.isNewChat) {
                    // Sometimes there is lag after the chat is created, so let's retry
                    setTimeout(loadChatRoom, 1000);
                    return;
                } else {
                    const errMsg = '[loadChatRoom] Object does not exist.';
                    console.warn(errMsg);
                    setUIError(errMsg);
                    return;
                }
            } else {
                const objData = (resp.details as SuiObject).data as SuiMoveObject;
                setUIError('');
                setChatObj(objData);
            }
        } catch(err) {
            const errMsg = '[loadChatRoom] Unexpected error while loading ChatRoom object: ' + err;
            console.warn(errMsg);
            setUIError(errMsg);
            return;
        }

        await pullRecentMessages(150);
        // Pull recent messages periodically because:
        // 1) The internet connection may have been lost
        // 2) We could lose messages between unsubscribe and subscribe
        refPullRecentIntervalId.current = setInterval(pullRecentMessages, PULL_RECENT_INTERVAL, 20);

        await resubscribeToEvents();
        // Periodically resubscribe (the browser closes the websocket after 30 seconds of innactivity)
        // We check if a reload is needed a lot more frequently than we actually reload,
        // because the user could have closed his laptop/phone, or the Internet may have been down.
        // This way we can initiate the reload quickly when the user/Internet is back.
        refResubscribeIntervalId.current = setInterval(resubscribeToEvents, RESUBSCRIBE_ATTEMPT_INTERVAL);
    };

    const unloadChatRoom = async () =>
    {
        refPullRecentIntervalId.current && clearInterval(refPullRecentIntervalId.current);
        refResubscribeIntervalId.current && clearInterval(refResubscribeIntervalId.current);
        unsubscribeFromEvents(); // MAYBE: retry if timeout
    }

    const pullRecentMessages = async (amount: number) => {
        if (refIsPullRecentOngoing.current) {
            console.debug('[pullRecentMessages] In progress. Skipping.');
            return;
        }
        refIsPullRecentOngoing.current = true;
        try {
            const events = await rpc.getEvents(
                { MoveEvent: packageId+'::event_chat::MessageEvent' },
                null,
                amount,
                'descending'
            );
            console.debug('[pullRecentMessages] Pulled recent messages');
            eventsToMessages(events.data.reverse());
            setUIError('');
        } catch(err) {
            const errMsg = '[pullRecentMessages] Failed to load recent messages: ' + err;
            console.warn(errMsg);
            setUIError(errMsg);
        } finally {
            refIsPullRecentOngoing.current = false;
        }
    };

    const resubscribeToEvents = async () => {
        if (refIsResubscribeOngoing.current) {
            console.debug('[resubscribeToEvents] In progress. Skipping.');
            return;
        }
        const timeOld = refLastResubscribeTime.current;
        const timeNow = (new Date()).getTime();
        const timeElapsed = timeNow - timeOld;
        if (timeElapsed < RESUBSCRIBE_MINIMUM_ELAPSED_TIME) {
            // console.debug(`[resubscribeToEvents] Updated recently (${timeElapsed/1000}s ago). Skipping`);
            return;
        }
        console.debug('[resubscribeToEvents] Resubscribing...');
        refIsResubscribeOngoing.current = true;
        await unsubscribeFromEvents();
        await subscribeToEvents();
        refLastResubscribeTime.current = timeNow;
        refIsResubscribeOngoing.current = false;
    };

    const subscribeToEvents = async () => {
        if (refEventSubscriptionId.current) {
            console.debug('[subscribeToEvents] Already subscribed. Skipping.');
            return;
        }
        try {
            refEventSubscriptionId.current = await rpcWebsocket.subscribeEvent(
                {And: [
                    { MoveEventType: packageId+'::event_chat::MessageEvent' },
                    { MoveEventField: { 'path': '/room', 'value': chatId} },
                ]},
                (event: SuiEventEnvelope) => eventsToMessages([event]),
            );
            console.debug('[subscribeToEvents] Subscribed:', refEventSubscriptionId.current);
            setUIError('');
        } catch (err) {
            const errMsg = '[subscribeToEvents] ' + err;
            console.warn(errMsg);
            // setUIError(errMsg);
        }
    };

    const unsubscribeFromEvents = async () => {
        if (!refEventSubscriptionId.current) {
            console.debug('[unsubscribeFromEvents] Not active subscription. Skipping.');
            return;
        }
        try {
            const subFoundAndRemoved = await rpcWebsocket.unsubscribeEvent(refEventSubscriptionId.current);
            refEventSubscriptionId.current = 0;
            console.debug('[unsubscribeFromEvents] Unsubscribed. subFoundAndRemoved:', subFoundAndRemoved);
            setUIError('');
        } catch (err) {
            const errMsg = '[unsubscribeFromEvents] ' + err;
            console.warn(errMsg);
            // setUIError(errMsg);
        }
    };

    const eventsToMessages = (events: Array<SuiEventEnvelope>) => {
        const userIsBanned = isBannedUser();
        const authorAddresses = new Set<SuiAddress>();
        for (const event of events) {
            // Skip if already included in map (common when called from pullRecentMessages)
            if (refMessages.current.has(event.txDigest))
                continue;
            // Check that the message belongs to this ChatRoom (needed for initial load,
            // because rpc.getEvents() can't filter by field)
            // @ts-ignore
            const msgRoom = event.event.moveEvent.fields.room;
            if (msgRoom != chatId) {
                continue;
            }
            // Skip messages from banned addresses (unless the user is banned)
            // @ts-ignore
            const msgAuthor = event.event.moveEvent.sender;
            // @ts-ignore
            const msgText = event.event.moveEvent.fields.text;
            if (!userIsBanned && bannedAddresses.includes(msgAuthor))
                continue;
            // Format and append the message
            refMessages.current.set(event.txDigest, {
                author: msgAuthor,
                text: msgText,
                timestamp: event.timestamp,
            });
            authorAddresses.add(msgAuthor);
        }

        // Trim the message Map every now and then
        if (refMessages.current.size > MAX_MESSAGES) {
            const targetSize = MAX_MESSAGES/2;
            console.debug(`[eventsToMessages] trimming message Map down to ${targetSize} messages`);
            const keysToDelete = Array.from(refMessages.current.keys()).slice(0, -targetSize);
            for (const key of keysToDelete) {
                refMessages.current.delete(key);
            }
        }

        // Update state
        setMessages(new Map(refMessages.current));
        fetchProfiles(authorAddresses);

        // Teaser for Polymedia Profile // MAYBE: replace with "create profile" CTA
        // if (refHasCurrentAccount.current && !refUserClosedTeaser.current) {
        //     const isMissingProfile = refLastUserAddr.current && refProfiles.current.get(refLastUserAddr.current) === null;
        //     isMissingProfile && formattedMessages.push({
        //         author: '0x0000000000000000000000000000000000000000',
        //         text: `Wake up ${refLastUserAddr.current}`,
        //         timestamp: String(Date.now()),
        //     });
        // }
    };

    // async function log(args: Array<any>) {
    //     fetch('', {
    //         method: 'POST',
    //         body: JSON.stringify(args),
    //     });
    // }
    const onSubmitAddMessage = async (e: SyntheticEvent) => {
        e.preventDefault();
        setUIError('');
        setIsSendingMsg(true);
        // await preapproveTxns();
        console.debug(`[onSubmitAddMessage] Calling event_chat::send_message on package: ${packageId}`);
        signAndExecuteTransaction({
            kind: 'moveCall',
            data: {
                packageObjectId: packageId,
                module: 'event_chat',
                function: 'send_message',
                typeArguments: [],
                arguments: [
                    chatId,
                    Array.from( (new TextEncoder()).encode(getChatInputValue()) ),
                ],
                gasBudget: SEND_MESSAGE_GAS_BUDGET,
            }
        })
        .then((resp: any) => {
            // @ts-ignore
            const effects = resp.effects.effects || resp.effects; // Suiet || Sui|Ethos
            if (effects.status.status == 'success') {
                // log([refUserFingerprint.current, refLastUserAddr.current, getChatInputValue()]);
                setChatInputValue('');
            } else {
                const errMsg = `[onSubmitAddMessage] Response error: ${effects.status.error}`;
                console.warn(errMsg);
                setUIError(errMsg);
            }
        })
        .catch((err) => {
            const errMsg = `[onSubmitAddMessage] Request error: ${err.message}`;
            console.warn(errMsg);
            setUIError(errMsg);
        })
        .finally(() => {
            setIsSendingMsg(false);
        });
    };

    /// Re-focus on the text input after sending a message
    useEffect(() => {
        if (!isSendingMsg && currentAccount) {
            focusChatInput();
        }
    }, [isSendingMsg]);

    /// Handle new messages
    useEffect(() => {
        // scroll to the bottom of the message list (if the user has not manually scrolled up)
        if (!refIsScrolledUp.current) {
            scrollToBottom();
        }
    }, [messages]);

    /// Handle errors
    useEffect(() => {
        scrollToBottom();
    }, [uiError]);

    const scrollToBottom = () => {
        if (refMessageList.current) {
            refMessageList.current.scrollTop = refMessageList.current.scrollHeight;
        }
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

    const closeProfileCTA = () => {
        setShowProfileCTA(false);
        refUserClosedProfileCTA.current=true;
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
        {Array.from(messages.values()).map((msg: any, idx) => {
            {/*const isPolymediaTeaser = msg.author == '0x0000000000000000000000000000000000000000';
            const profile = isPolymediaTeaser
                ? ({
                    name: 'The Professor',
                    url: 'https://i.imgur.com/au3wKTL.jpg',
                    owner: msg.author,
                } as PolymediaProfile)
                : refProfiles.current.get(msg.author);
            let teaserButtons = <></>;
            if (isPolymediaTeaser) {
                teaserButtons = <div className='teaser-buttons'>
                    <button className='primary open-eyes' onClick={() => {
                        window.open('https://mountsogol.com?network='+network, '_self')
                    }}>Open eyes 👀</button>
                    <button className='primary' onClick={() => {
                        // refUserClosedTeaser.current=true; setMessages(messages.slice(0, -1)); // MAYBE
                    }}>Stay asleep 😴</button>
                </div>;
            }*/}
            const profile = refProfiles.current.get(msg.author);
            const hasPfpImage = profile && profile.url;
            let pfpClasses = 'message-pfp';
            const pfpStyles: any = {};
            if (hasPfpImage) {
                pfpStyles.backgroundImage = 'url('+encodeURI(profile.url)+')';
                pfpClasses += ' polymedia-profile';
            } else {
                pfpStyles.backgroundColor = getAddressColor(msg.author, 12);
            }
            const magicText = parseMagicText(refProfiles.current, msg.text, copyAddress);
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
                    {/*{teaserButtons}*/}
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

            { uiError && <div className='error'>{uiError}</div> }

            { showProfileCTA && <div id='profile-cta'>
                <span className='cta-text'>Hey anon, <a href='https://profile.polymedia.app/manage'
                    target='_blank' onClick={closeProfileCTA}>create a profile
                    </a> so people know what to call you.
                </span>
                <span className='cta-close'><span onClick={closeProfileCTA}>close</span>
                </span>
            </div>
            }

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
        module: 'vector_chat',
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
        setUIError(`[preapproveTxns] Error requesting preapproval: ${err.message}`)
    });
}, [wallet]);
*/
