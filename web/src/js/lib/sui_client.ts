/// Helpers to parse/fetch/publish `polymedia::item::Item` objects on the Sui network

import { JsonRpcProvider, SuiTransactionResponse, GetObjectDataResponse } from '@mysten/sui.js';

export const POLYMEDIA_PACKAGE = '0xc8a3192c95e6daa5f37c170dd8d3bc0843344ada';
export const rpc = new JsonRpcProvider('https://fullnode.devnet.sui.io:443');

/* Types */

/// Represents a `polymedia::item::Item` Sui object
export type Item = {
    id: string, // The Sui object UID
    account: string,
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
    // Handle leading zeros ('0x00ab::item::Item' is returned as '0xab::item::Item' by the RPC)
    const packageName = POLYMEDIA_PACKAGE.replace(/0x0+/, '0x0*'); // handle leading zeros
    const typeRegex = new RegExp(`^${packageName}::item::Item$`);
    if (!details.data.type.match(typeRegex)) {
        console.warn('[getBet] Wrong object type:', details.data.type);
        return null;
    }

    const fields = details.data.fields;
    const item: Item = {
        id: fields.id.id,
        account: fields.account,
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
