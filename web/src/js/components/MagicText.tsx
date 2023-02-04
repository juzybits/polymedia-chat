/// Transform plain text into rich text HTML (with links, images, clickable addresses, etc)

import React from 'react';
import { shortenAddress, getAddressColor } from '../lib/addresses';
import { isTrustedDomain } from '../lib/domains';

const REGEX_ADDRESS = new RegExp(/0x[a-fA-F0-9]{40}/g);
const REGEX_IMAGE = new RegExp(/[.=/](apng|avif|gif|jpeg|jpg|png|svg|webp)[^a-zA-Z]?/);
const REGEX_URL = new RegExp(/(?:https?|ipfs):\/\/[^\s\/$.?#].[^\s]*[^\s.,|]+/ig);
// const REGEX_TWEET = new RegExp('https://twitter.com/[^/]+/status/.+');

/// Shorten a 0x address, style it, and make it clickable
export function MagicAddress(props: any) {
    const shortAddr = shortenAddress(props.address);
    const text = props.profileName
        ? <>{props.profileName} | {shortAddr}</>
        : <>{shortAddr}</>;
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
export function parseMagicText(plainText: string, onClickAddress: Function)
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
            chunks.push( chunk(<MagicAddress address={address} onClickAddress={onClickAddress} />) );
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
