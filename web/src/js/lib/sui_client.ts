/// Helpers to parse/fetch/publish `polymedia::item::Item` objects on the Sui network

import { JsonRpcProvider, SuiTransactionResponse, GetObjectDataResponse } from '@mysten/sui.js';
import { SuiWalletAdapter } from '@mysten/wallet-adapter-sui-wallet';

const POLYMEDIA_PACKAGE = '0x4938aa0dbf8e67c4d9aefe069c70281c417a7b13';
const GAS_BUDGET = 10000;
const rpc = new JsonRpcProvider('https://fullnode.devnet.sui.io:443');
const wallet = new SuiWalletAdapter();

/* Wallet functions */

export function isInstalled(): boolean {
    return window.hasOwnProperty('suiWallet');
}

export function isConnected(): boolean {
    return wallet.connected;
}

export async function connect(): Promise<void> {
    return wallet.connect();
}

export async function disconnect(): Promise<void> {
    return wallet.disconnect();
}

/// Get the addresses from the current wallet
export async function getAddresses(): Promise<string[]> {
    return wallet.getAccounts();
}

/* Types */

/// Represents a `polymedia::item::Item` Sui object
export type Item = {
    id: string, // The Sui object UID
    kind: string,
    version: string,
    name: string,
    text: string,
    url: string,
    data: string,
};

function parseItem(resp: GetObjectDataResponse): Item|null
{
    if (resp.status != 'Exists') {
        console.warn('[getBet] Object does not exist. Status:', resp.status);
        return null;
    }

    const details = resp.details as any;
    const typeRegex = new RegExp(`^${POLYMEDIA_PACKAGE}::item::Item$`);
    if (!details.data.type.match(typeRegex)) {
        // TODO: '0x0ab' is returned as '0xab' by the RPC
        console.warn('[getBet] Wrong object type:', details.data.type);
        return null;
    }

    const fields = details.data.fields;
    const item: Item = {
        id: fields.id.id,
        kind: fields.kind,
        version: fields.version,
        name: fields.name,
        text: fields.text,
        url: fields.url,
        data: JSON.parse(fields.data),
    };
    return item;
}

/* RPC functions */

/// Fetch and parse `polymedia::item::Item` Sui objects
export async function getItems(objectIds: string[]): Promise<Item[]>
{
    console.debug(`[getItem] Fetching ${objectIds.length} objects`);
    return rpc.getObjectBatch(objectIds)
        .then((objectsData: GetObjectDataResponse[]) => {
            return objectsData.reduce((items: Item[], resp: GetObjectDataResponse) => {
                const item = parseItem(resp);
                item && items.push(item);
                return items;
            }, []);
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
    data: string,
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
            stringToIntArray(data),
        ],
        gasBudget: GAS_BUDGET,
    });
}

/* Helpers */

function stringToIntArray(text: string): number[] {
    const encoder = new TextEncoder();
    return Array.from( encoder.encode(text) );
}
