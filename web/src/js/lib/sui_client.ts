/// Helpers to parse/fetch/publish `polymedia::item::Item` objects on the Sui network

import { JsonRpcProvider } from '@mysten/sui.js';
import { SuiWalletAdapter } from '@mysten/wallet-adapter-sui-wallet';

const POLYMEDIA_PACKAGE = 'TODO';
const GAS_BUDGET = 2000;
const rpc = new JsonRpcProvider('https://fullnode.devnet.sui.io:443');
const wallet = new SuiWalletAdapter();

/* Wallet functions */

export async function connect(): Promise<void> {
    return wallet.connect();
}

export async function disconnect(): Promise<void> {
    return wallet.disconnect();
}

export function isConnected(): bool {
    return wallet.connected;
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

/* RPC functions */

/// Represents a `polymedia::item::Item` Sui object.
export type Item = {
    id: string, // The Sui object UID
    name: string,
    text: string,
    // ...
};

/// Fetch and parse a `polymedia::item::Item` Sui object into our custom Item type
export async function getItem(objId: string): Promise<Item|null> {
    console.debug('[getItem] Looking up:', objId);

    const typeRegex = new RegExp(`^${POLYMEDIA_PACKAGE}::item::Item<0x.+::.+::.+>$`);
    return rpc.getObject(objId)
        .then(obj => {
            if (obj.status != 'Exists') {
                console.warn('[getItem] Object does not exist. Status:', obj.status);
                return null;
            } else
            if (!obj.details.data.type.match(typeRegex)) {
                // TODO: '0x0ab' is returned as '0xab' by the RPC
                console.warn('[getItem] Found wrong object type:', obj.details.data.type);
                return null;
            } else {
                console.debug('[getItem] Found Item object:', obj);
                const fields = obj.details.data.fields;
                const item: Item = {
                    id: fields.id.id,
                    name: fields.name,
                    text: fields.text,
                    // ...
                };
                return item;
            }
        })
        .catch(error => {
            console.warn('[getItem] RPC error:', error.message);
            return null;
        });
}

/* Functions to call the `public entry` functions in the `gotbeef::bet` Sui package */

export async function createItem(
    name: string,
    text: string,
): Promise<SuiTransactionResponse>
{
    console.debug(`[createItem] Calling item::create on package: ${POLYMEDIA_PACKAGE}`);
    await syncAccountState();
    return wallet.executeMoveCall({
        packageObjectId: POLYMEDIA_PACKAGE,
        module: 'item',
        function: 'create',
        arguments: [
            name,
            text,
            // ...
        ],
        gasBudget: GAS_BUDGET,
    });
}