/// Helpers to parse/fetch/publish `polymedia::item::Item` objects on the Sui network

import { JsonRpcProvider, SuiTransactionResponse, GetObjectDataResponse } from '@mysten/sui.js';
import { SuiWalletAdapter } from '@mysten/wallet-adapter-sui-wallet';

const POLYMEDIA_PACKAGE = 'TODO';
const GAS_BUDGET = 10000;
const rpc = new JsonRpcProvider('https://fullnode.devnet.sui.io:443');
const wallet = new SuiWalletAdapter();

/* Wallet functions */

export async function connect(): Promise<void> {
    return wallet.connect();
}

export async function disconnect(): Promise<void> {
    return wallet.disconnect();
}

export function isConnected(): boolean {
    return wallet.connected;
}

export function isInstalled(): boolean {
    return window.hasOwnProperty('suiWallet');
}

/// Get the addresses from the current wallet
export async function getAddresses(): Promise<string[]> {
    return wallet.getAccounts().then(accounts => {
        if (!accounts) {
            throw 'No accounts found'; // should never happen
        }
        return accounts;
    });
}

/* Types */

/// Represents a `polymedia::item::Item` Sui object.
export type Item = {
    id: string, // The Sui object UID
    kind: string,
    version: string,
    name: string,
    text: string,
    url: string,
    addressesKeys: string[],
    addressesVals: string[],
    stringsKeys: string[],
    stringsVals: string[],
    u64sKeys: string[],
    u64sVals: number[],
};

function parseItem(data: GetObjectDataResponse): Item { // TODO
    const item: Item = {
        id: '',
        kind: '',
        version: '',
        name: '',
        text: '',
        url: '',
        addressesKeys: [],
        addressesVals: [],
        stringsKeys: [],
        stringsVals: [],
        u64sKeys: [],
        u64sVals: [],
    };
    return item;
}

/* RPC functions */

/// Fetch and parse `polymedia::item::Item` Sui objects
export async function getItems(objectIds: string[]): Promise<Item[]> {
    console.debug(`[getItem] Fetching ${objectIds.length} objects`);
    return rpc.getObjectBatch(objectIds)
        .then((objectsData: GetObjectDataResponse[]) => {
            return objectsData.map(data => parseItem(data));
        })
        .catch(error => {
            console.warn('[getItems] RPC error:', error.message);
            return [];
        });
}

/* Functions to call the `public entry` functions in the `gotbeef::bet` Sui package */

export async function createItem(
    kind: string,
    version: string,
    name: string,
    text: string,
    url: string,
    addressesKeys: string[],
    addressesVals: string[],
    stringsKeys: string[],
    stringsVals: string[],
    u64sKeys: string[],
    u64sVals: number[],
): Promise<SuiTransactionResponse>
{
    console.debug(`[createItem] Calling item::create on package: ${POLYMEDIA_PACKAGE}`);
    return wallet.executeMoveCall({
        packageObjectId: POLYMEDIA_PACKAGE,
        module: 'item',
        function: 'create',
        typeArguments: [],
        arguments: [
            stringToIntArray(kind),
            stringToIntArray(version),
            stringToIntArray(name),
            stringToIntArray(text),
            stringToIntArray(url),
            stringsToIntArrays(addressesKeys),
            stringsToIntArrays(addressesVals),
            stringsToIntArrays(stringsKeys),
            stringsToIntArrays(stringsVals),
            stringsToIntArrays(u64sKeys),
            u64sVals,
        ],
        gasBudget: GAS_BUDGET,
    });
}

/* Helpers */

function stringToIntArray(text: string): number[] {
    return Array.from( (new TextEncoder()).encode(text) );
}

function stringsToIntArrays(texts: string[]): any[] {
    return texts.map(text => stringToIntArray(text) );
}
