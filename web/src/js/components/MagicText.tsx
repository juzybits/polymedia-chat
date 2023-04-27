/// Transform plain text into rich text HTML (with links, images, clickable addresses, etc)

import React from 'react';
import { SuiAddress } from '@mysten/sui.js';

import { ChatProfile } from '../ChatView';
import { shortenAddress, getAddressColor } from '../lib/addresses';
import { isTrustedDomain } from '../lib/domains';
import badgeAdmin from '../../img/badge_admin.svg';
import badgeVerified from '../../img/badge_verified.svg';

const REGEX_ADDRESS = new RegExp(/0x[a-fA-F0-9]{64}/g);
// TODO: support image URLs like https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9G...
// TODO: support image URLs like data:image/jpeg;base64,/9j/...
const REGEX_IMAGE = new RegExp(/[.=/](apng|avif|gif|jpeg|jpg|png|svg|webp)[^a-zA-Z]?/);
const REGEX_URL = new RegExp(/(?:https?|ipfs):\/\/[^\s\/$.?#].[^\s]*[^\s.,|]+/ig);
// const REGEX_TWEET = new RegExp('https://twitter.com/[^/]+/status/.+');

/// Shorten a 0x address, style it, and make it clickable
export function MagicAddress(props: any) {
    const shortAddr = shortenAddress(props.address);
    let text: React.ReactNode;
    if (props.profile) {
        let badge: React.ReactNode;
        if (props.profile.badge === 'admin') {
            badge = <img className='admin-badge' src={badgeAdmin} />;
        } else if (props.profile.badge === 'verified') {
            badge = <img className='verified-badge' src={badgeVerified} />;
        } else {
            badge = <></>;
        }
        text = <>{props.profile.name} ({shortAddr}){badge}</>;
    } else {
        text = <>{shortAddr}</>;
    }

    return <span onClick={() => props.onClickAddress(props.address)}
        className='magic-address'
        style={{ color: getAddressColor(props.address, 6, true) }} >
        {text}
    </span>;
};

export function MagicLink(props: any) {
    return isTrustedDomain(props.href)
        ? <a href={props.href} target='_blank'>{props.href}</a>
        : props.href;
};

/// The result of parseMagicText()
export type MagicText = {
    text: React.ReactNode,
    images: null|Array<string>,
    // tweets: null|Array<string>,
};

/// Parse plaintext and format any URLs and 0x addresses in it
export function parseMagicText(profiles: Map<SuiAddress, ChatProfile|null>, plainText: string, onClickAddress: Function)
{
    let key = 0;
    const chunk = (contents: any) => {
        return <React.Fragment key={key++}>{contents}</React.Fragment>;
    };

    const ReplaceAddresses = (props: any) => {
        const addresses = props.plainText.match(REGEX_ADDRESS) || [];
        const nonAddresses = props.plainText.split(REGEX_ADDRESS);

        let chunks = [ chunk(nonAddresses.shift()) ];
        for (let address of addresses) {
            const profile = profiles.get(address);
            chunks.push( chunk(<MagicAddress address={address} onClickAddress={onClickAddress} profile={profile} />) );
            chunks.push( chunk(nonAddresses.shift()) );
        }
        return <>{chunks}</>;
    };

    const urls = plainText.match(REGEX_URL) || [];
    const imgUrls = [];
    // const tweetUrls = [];
    const nonUrls = plainText.split(REGEX_URL);

    let chunks = [ chunk(<ReplaceAddresses plainText={nonUrls.shift()} />) ];
    for (let url of urls) {
        if ( url.match(REGEX_IMAGE) ) {
            imgUrls.push(url);
        } else {
            chunks.push( chunk(<MagicLink href={url} text={url} />) );
        }
        chunks.push( chunk(<ReplaceAddresses plainText={nonUrls.shift()} />) );
        // } else if ( url.match(REGEX_TWEET) ) {
        //     tweetUrls.push(url);
        // }
    }

    const magicText: MagicText = {
        text: <>{chunks}</>,
        images: imgUrls.length ? imgUrls : null,
        // tweets: tweetUrls.length ? tweetUrls : null,
    };
    return magicText;
};
