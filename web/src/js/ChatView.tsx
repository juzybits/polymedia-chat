import { useEffect, useRef, useState, SyntheticEvent } from 'react';
import { Link, useParams, useOutletContext } from 'react-router-dom';
import {
    SuiEvent,
    SuiObjectResponse,
    TransactionEffects,
    Unsubscribe,
} from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useWalletKit } from '@mysten/wallet-kit';
import { PolymediaProfile } from '@polymedia/profile-sdk';
// import FingerprintJS from '@fingerprintjs/fingerprintjs'

import { AppContext } from './App';
import EmojiPicker from './components/EmojiPicker';
import { Nav } from './components/Nav';
import { parseMagicText, MagicAddress } from './components/MagicText';
import { timeAgo } from './lib/common';
import { getAddressColor, getAddressEmoji } from './lib/addresses';
import { ChatRoom, getConfig } from './lib/chat';
import '../css/Chat.less';

const RESUBSCRIBE_INTERVAL = 24000; // How often to resubscribeToEvents()
const PULL_RECENT_INTERVAL = 8000; // How often to pull recent messages
const PULL_RECENT_AMOUNT = 30; // How many recent messages to pull each time
const PULL_RECENT_AMOUNT_1ST_PULL = 50; // How many recent messages to pull the first time
// const MAX_MESSAGES = 500;

type Message = {
    author: string,
    text: string,
    timestamp: number,
};

type MessageEvent = {
    room: string,
    text: string,
};

export type ChatProfile = PolymediaProfile & {
    badge: 'admin' | 'verified' | null;
};

// Messages from these addresses will be hidden from everyone except from their authors
const bannedAddresses: string[] = [
];

// const bannedFingerprints: string[] = [
// ];

// Shows yellow checkmark
const adminAddresses: string[] = [
    '0x5d8133281aa26ad73542c0b53014c6831c37b9d98e7603fd0db2e1cc4453934a', // Sui
    '0xe956f7c91679020f75d94c44f08fe5caefb4b1be6d384b9f1093ddccff6a93f5', // Ethos
    '0x017d58f4347357b1157c00eb2e67e318a83673decc6a7dd9fe24d34c202c2713', // Suiet
    '0x7102570010cdc0f73bd14372c5a33df6f4560f11d75fbd87c1ab372755276ebc', // Martian
];

// Shows blue checkmark
const verifiedAddresses: string[] = [
    '0x48eebdd5a77bafe1092e370bcc838451f8d4973b8de5d7cb2274ccd9acb7e7d9', // tanveer
    '0x2adf56292ff2888e825e6d5ec9cdf846bc322236cdd8c9adc298ffe441eb23e3', // Davidsknight
];

// To fight spammers
// const fpPromise = FingerprintJS.load({monitoring: false});

export const ChatView: React.FC = () =>
{
    /* Global state */
    const {
        network,
        suiClient,
        profileManager,
        notify,
        connectModalOpen,
        setConnectModalOpen
    } = useOutletContext<AppContext>();
    const { polymediaPackageId, suiFansChatId } = getConfig(network);
    const { currentAccount, signTransactionBlock } = useWalletKit();
    /* User and Polymedia Profile */
    const refProfiles = useRef( new Map<string, ChatProfile|null>() );
    const refHasCurrentAccount = useRef(false);
    const refLastUserAddr = useRef(localStorage.getItem('polymedia.userAddr') || ''); // MAYBE: store an array
    const [showProfileCTA, setShowProfileCTA] = useState(false);
    const refUserClosedProfileCTA = useRef(false);
    // const refUserClosedTeaser = useRef(false);
    /* Chat messages */
    const [chatObj, setChatObj] = useState<ChatRoom|null>(null);
    const [messages, setMessages] = useState(new Map<string, Message>);
    const [isSendingMsg, setIsSendingMsg] = useState(false); // waiting for a message txn to complete
    const refMessages = useRef(messages);
    /* Reloading messages */
    const refUnsubscribeEvent = useRef<Unsubscribe|null>(null);
    const refResubscribeIntervalId = useRef<ReturnType<typeof setInterval>|null>(null);
    const refIsResubscribeOngoing = useRef(false);
    const refPullRecentIntervalId = useRef<ReturnType<typeof setInterval>|null>(null);
    const refIsPullRecentOngoing = useRef(false);
    /* Emoji picker */
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [ignoreClickOutside, setIgnoreClickOutside] = useState(true);
    const [chatInputCursor, setChatInputCursor] = useState(0);
    /* UI state, and references to HTML elements */
    const [uiError, setUIError] = useState('');
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const refIsScrolledUp = useRef(false); // to stop reloading the chat when the user scrolls up
    const refFirstMessageTx = useRef<string|null>(null);
    const refFirstMessageEl = useRef<HTMLDivElement|null>(null);
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
    const isBannedUser = () => { // MAYBE: account for users with multiple addresses/wallets
        return refLastUserAddr.current && bannedAddresses.includes(refLastUserAddr.current);
    };

    // Handle '/@sui-fans' alias
    let chatId = useParams().uid || '';
    const chatAlias = chatId;
    if (chatAlias == '@sui-fans') {
        chatId = suiFansChatId;
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
        refLastUserAddr.current = currentAccount.address;
        localStorage.setItem('polymedia.userAddr', currentAccount.address);

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

    const fetchProfiles = (authors: Set<string>) => {
        let newAuthors = new Set<string>();
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
        profileManager.getProfilesByOwner({lookupAddresses: newAuthors})
        .then(newProfiles => {
            for (const [address, profile] of newProfiles.entries()) {
                let chatProfile: ChatProfile|null = null;
                if (profile) {
                    let badge: ChatProfile['badge'] = null;
                    if (adminAddresses.includes(profile.owner)) {
                        badge = 'admin';
                    } else if (verifiedAddresses.includes(profile.owner)) {
                        badge = 'verified';
                    }
                    chatProfile = {...profile, badge};
                }
                refProfiles.current.set(address, chatProfile);
            }
            setMessages(new Map(refMessages.current));
            maybeShowProfileCTA();
        })
        .catch(err => {
            console.warn('[fetchProfiles]', err);
        })
    };

    /* Messages */

    const loadChatRoom = async () =>
    {
        // Pull the ChatRoom object
        try {
            const resp: SuiObjectResponse = await suiClient.getObject({
                id: chatId,
                options: {
                    showContent: true,
                },
            });
            if (resp.error) {
                const errMsg = '[loadChatRoom] Object does not exist. resp.error: ' + JSON.stringify(resp.error);
                console.warn(errMsg);
                setUIError(errMsg);
                return;
            } else if (!resp.data) {
                const errMsg = '[loadChatRoom] Missing object data. resp: ' + JSON.stringify(resp);
                console.warn(errMsg);
                setUIError(errMsg);
                return;
            } else {
                setUIError('');
                const content = resp.data.content;
                const isObj = content && content.dataType === 'moveObject';
                setChatObj(isObj ? content.fields as ChatRoom : null);
            }
        } catch(err) {
            const errMsg = '[loadChatRoom] Unexpected error while loading ChatRoom object: ' + err;
            console.warn(errMsg);
            setUIError(errMsg);
            return;
        }

        await pullRecentMessages(PULL_RECENT_AMOUNT_1ST_PULL);
        // Pull recent messages periodically because:
        // 1) The internet connection may have been lost
        // 2) We could lose messages between unsubscribe and subscribe
        refPullRecentIntervalId.current = setInterval(pullRecentMessages, PULL_RECENT_INTERVAL, PULL_RECENT_AMOUNT);

        await resubscribeToEvents();
        // Periodically resubscribe (the browser closes the websocket after 30 seconds of inactivity)
        refResubscribeIntervalId.current = setInterval(resubscribeToEvents, RESUBSCRIBE_INTERVAL);
    };

    const unloadChatRoom = async () =>
    {
        refPullRecentIntervalId.current && clearInterval(refPullRecentIntervalId.current);
        refResubscribeIntervalId.current && clearInterval(refResubscribeIntervalId.current);
        unsubscribeFromEvents(); // MAYBE: retry if timeout
    }

    const pullOldMessages = async () => {
        setIsLoadingMore(true);
        try {
            const currentOldestMsgTxDigest = messages.keys().next().value;
            const oldEvents = await suiClient.queryEvents({
                query: { MoveEventType: polymediaPackageId+'::event_chat::MessageEvent' }, // TODO: filter by 'room' field (https://github.com/MystenLabs/sui/issues/11031)
                cursor: { txDigest: currentOldestMsgTxDigest, eventSeq: '0' },
                limit: 50,
                order: 'descending'
            });
            console.debug('[pullOldMessages] Pulled old messages');
            const newestOldMsgTxDigest = oldEvents.data[0].id.txDigest;
            refFirstMessageTx.current = newestOldMsgTxDigest; // to scroll the user here
            eventsToMessages(oldEvents.data.reverse(), true);
        } catch(err) {
            console.warn('[pullOldMessages] Failed to load old messages: ', err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const pullRecentMessages = async (amount: number) => {
        if (refIsPullRecentOngoing.current) {
            console.debug('[pullRecentMessages] In progress. Skipping.');
            return;
        }
        setUIError('');
        refIsPullRecentOngoing.current = true;
        try {
            const allEvents = new Array<SuiEvent>();
            let remainingEvents = amount;
            let cursor = null;
            while (remainingEvents > 0) {
                const limit = Math.min(remainingEvents, 50);
                const events = await suiClient.queryEvents({
                    query: { MoveEventType: polymediaPackageId+'::event_chat::MessageEvent' }, // TODO: filter by 'room' field (https://github.com/MystenLabs/sui/issues/11031)
                    // query: {And: [
                    //     { MoveEventType: polymediaPackageId+'::event_chat::MessageEvent' },
                    //     { MoveEventField: { 'path': '/room', 'value': chatId} },
                    // ]},
                    cursor: cursor,
                    limit: limit,
                    order: 'descending'
                });
                allEvents.push(...events.data);
                remainingEvents -= limit;
                if (events.hasNextPage) {
                    cursor = events.nextCursor;
                } else {
                    break;
                }
            }
            console.debug('[pullRecentMessages] Pulled recent messages');
            eventsToMessages(allEvents.reverse());
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
        console.debug('[resubscribeToEvents] Resubscribing...');
        refIsResubscribeOngoing.current = true;
        await unsubscribeFromEvents();
        await subscribeToEvents();
        refIsResubscribeOngoing.current = false;
    };

    const subscribeToEvents = async () => {
        if (refUnsubscribeEvent.current) {
            console.debug('[subscribeToEvents] Already subscribed. Skipping.');
            return;
        }
        try {
            refUnsubscribeEvent.current = await suiClient.subscribeEvent({
                filter: {And: [
                    { MoveEventType: polymediaPackageId+'::event_chat::MessageEvent' },
                    { MoveEventField: { 'path': '/room', 'value': chatId} },
                ]},
                onMessage: (event: SuiEvent) => eventsToMessages([event]),
            });
            console.debug('[subscribeToEvents] Subscribed.');
            setUIError('');
        } catch (err) {
            const errMsg = '[subscribeToEvents] ' + err;
            console.warn(errMsg);
            // setUIError(errMsg);
        }
    };

    const unsubscribeFromEvents = async () => {
        if (!refUnsubscribeEvent.current) {
            console.debug('[unsubscribeFromEvents] Not active subscription. Skipping.');
            return;
        }
        try {
            const unsubscribed = await refUnsubscribeEvent.current();
            refUnsubscribeEvent.current = null;
            console.debug('[unsubscribeFromEvents] Unsubscribed: ', unsubscribed);
            setUIError('');
        } catch (err) {
            const errMsg = '[unsubscribeFromEvents] ' + err;
            console.warn(errMsg);
            // setUIError(errMsg);
        }
    };

    const eventsToMessages = (events: Array<SuiEvent>, prepend=false) => {
        const userIsBanned = isBannedUser();
        const authorAddresses = new Set<string>();
        const oldMessages: typeof messages = new Map();
        for (const event of events) {
            // Skip if already included in map (common when called from pullRecentMessages)
            if (refMessages.current.has(event.id.txDigest))
                continue;
            // Check that the message belongs to this ChatRoom (needed for initial load,
            // because suiClient.getEvents() can't filter by field)
            const msgEvent = event.parsedJson as MessageEvent;
            if (msgEvent.room != chatId) {
                continue;
            }
            // Skip messages from banned addresses (unless the user is banned)
            const msgAuthor = event.sender;
            if (!userIsBanned && bannedAddresses.includes(msgAuthor))
                continue;
            // Format and append the message
            (prepend ? oldMessages : refMessages.current).set(
                event.id.txDigest,
                {
                    author: msgAuthor,
                    text: msgEvent.text,
                    timestamp: Number(event.timestampMs||0),
                }
            );
            authorAddresses.add(msgAuthor); // TODO: include addresses within message text
        }
        if (prepend && oldMessages.size) {
            refMessages.current = new Map([...oldMessages, ...refMessages.current]);
        }

        /*
        // Trim the message Map every now and then
        if (refMessages.current.size > MAX_MESSAGES) {
            const targetSize = MAX_MESSAGES/2;
            console.debug(`[eventsToMessages] trimming message Map down to ${targetSize} messages`);
            const keysToDelete = Array.from(refMessages.current.keys()).slice(0, -targetSize);
            for (const key of keysToDelete) {
                refMessages.current.delete(key);
            }
        }
        */

        // Update state
        setMessages(new Map(refMessages.current));
        fetchProfiles(authorAddresses);

        // Teaser for Polymedia Profile // MAYBE: replace with 'create profile' CTA
        // if (refHasCurrentAccount.current && !refUserClosedTeaser.current) {
        //     const isMissingProfile = refLastUserAddr.current && refProfiles.current.get(refLastUserAddr.current) === null;
        //     isMissingProfile && formattedMessages.push({
        //         author: '0x0000000000000000000000000000000000000000',
        //         text: `Wake up ${refLastUserAddr.current}`,
        //         timestamp: String(Date.now()),
        //     });
        // }
    };

    // async function log(_args: Array<any>) {
        // fetch('', {
        //     method: 'POST',
        //     body: JSON.stringify(args),
        // });
    // }
    const onSubmitAddMessage = async (e: SyntheticEvent) => {
        e.preventDefault();
        setUIError('');
        setIsSendingMsg(true);
        // await preapproveTxns();
        console.debug(`[onSubmitAddMessage] Calling event_chat::send_message on package: ${polymediaPackageId}`);

        const messageText = getChatInputValue();
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${polymediaPackageId}::event_chat::send_message`,
            typeArguments: [],
            arguments: [
                tx.object(chatId),
                tx.pure(Array.from((new TextEncoder()).encode(messageText))),
            ],
        });

        const signedTx = await signTransactionBlock({
            transactionBlock: tx,
            chain: `sui:${network}`,
        });
        return suiClient.executeTransactionBlock({
            transactionBlock: signedTx.transactionBlockBytes,
            signature: signedTx.signature,
            options: {
                showEffects: true,
            },
        })
        .then(resp => {
            const effects = resp.effects as TransactionEffects;
            if (effects.status.status == 'success') {
                setChatInputValue('');
                // Immediately render the user message if the transaction is confirmed
                if (resp.confirmedLocalExecution) {
                    refMessages.current.set(resp.digest, {
                        author: refLastUserAddr.current,
                        text: messageText,
                        timestamp: Number(Date.now()),
                    });
                    // Update state
                    setMessages(new Map(refMessages.current));
                    fetchProfiles(new Set<string>([refLastUserAddr.current]));
                }
                // log([refUserFingerprint.current, refLastUserAddr.current, getChatInputValue()]);
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
        // on 'load more', scroll the user to the newest out of the old messages
        if (refFirstMessageTx.current && refFirstMessageEl.current) {
            refFirstMessageEl.current.scrollIntoView();
            refFirstMessageTx.current = null;
            refFirstMessageEl.current = null;
        }
        // scroll to the bottom of the message list (if the user has not manually scrolled up)
        else if (!refIsScrolledUp.current) {
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

    const description = chatObj ? chatObj.description : '';
    return <div id='page' className='page-tool'>
    <div id='chat-wrapper'>
        <Nav network={network} menuPath={`/${chatAlias}/menu`} />
        <div className='chat-top'>
            <div className='chat-title'>
               <h1 className='chat-title'>{chatObj ? chatObj.name : 'Loading...'}</h1>
                { chatObj && <span className='chat-title-divider'></span> }
                <Link className='chat-description' to={`/${chatAlias}/menu`}>
                    { description.length > 70 ? description.slice(0, 70)+' ...': description }
                </Link>
            </div>
        </div>

        <div ref={refMessageList} id='message-list' className='chat-middle' onScroll={onScrollMessageList}>
        <div id='load-more'>
            {
                !messages.size ? <></> : (
                isLoadingMore
                ? <label id='load-more-loading'>Loading...</label>
                : <button id='load-more-btn' className='btn primary' onClick={pullOldMessages}>LOAD MORE</button>
                )
            }
        </div>
        {Array.from(messages.entries()).map(([txDigest, msg]) => {
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
            const hasPfpImage = profile && profile.imageUrl;
            let pfpClasses = 'message-pfp';
            const pfpStyles: any = {};
            if (hasPfpImage) {
                pfpStyles.backgroundImage = 'url('+encodeURI(profile.imageUrl)+')';
                pfpClasses += ' polymedia-profile';
            } else {
                pfpStyles.backgroundColor = getAddressColor(msg.author, 12);
            }
            const magicText = parseMagicText(refProfiles.current, msg.text, copyAddress);
            const isFirstMessage = refFirstMessageTx.current === txDigest;
            return (
            <div
                key={txDigest}
                ref={isFirstMessage ? (el) => (refFirstMessageEl.current = el) : null}
                className={`message ${currentAccount && msg.text.includes(currentAccount.address) ? 'highlight' : ''}`}
            >
                <div className='message-pfp-wrap'>
                    <span className={pfpClasses} style={pfpStyles} onClick={() => copyAddress(msg.author)}>
                        {!hasPfpImage && getAddressEmoji(msg.author)}
                    </span>
                </div>
                <span className='message-body'>
                    <span className='message-author'>
                        <MagicAddress address={msg.author} onClickAddress={copyAddress} profile={profile} />
                    </span>
                    <span className='message-timestamp'>
                        {timeAgo(msg.timestamp)}
                    </span>
                    <div className='message-text'>
                        {magicText.text}
                    </div>
                    {magicText.images &&
                    <div className='message-images'>
                        { magicText.images.map((url, idx) => <a href={url} target='_blank' rel='noopener nofollow noreferrer' key={idx}><img src={url}/></a>) }
                    </div>}
                    {/*{teaserButtons}*/}
                    {/*{magicText.tweets &&
                    <div className='message-tweets'>
                        { magicText.tweets.map((url, idx) => <blockquote className='twitter-tweet' key={idx}><a href={url}></a></blockquote>) }
                    </div>}*/}
                </span>
            </div>
            );
        })}
        </div>

        <div ref={refChatBottom} className='chat-bottom'>
            <form onSubmit={onSubmitAddMessage} className='chat-input-wrapper'
                  onClick={currentAccount ? undefined : () => setConnectModalOpen(true)}>
                <input ref={refChatInput} type='text' required
                    maxLength={2000}
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
                    target='_blank' rel='noopener' onClick={closeProfileCTA}>create a profile
                    </a> so people know what to call you.
                </span>
                <span className='cta-close'><span onClick={closeProfileCTA}>close</span>
                </span>
            </div>
            }

            { showEmojiPicker &&
                <EmojiPicker
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
        packageObjectId: polymediaPackageId,
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
