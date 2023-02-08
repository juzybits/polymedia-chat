/// Helpers to parse/fetch/publish `polymedia_chat::item::Item` objects on the Sui network

import { JsonRpcProvider, Network } from '@mysten/sui.js';

const RPC_DEVNET = new JsonRpcProvider(Network.DEVNET);
const POLYMEDIA_PACKAGE_DEVNET = '0x9ed1f65e520d0af8c5837b57a33ff4d70ae2653d';
const SUI_FANS_CHAT_ID_DEVNET = '0xda7096fc386427f262fc9b6a5f3139f2e7db83db';

const RPC_TESTNET = new JsonRpcProvider('https://fullnode.testnet.sui.io:443');
const POLYMEDIA_PACKAGE_TESTNET = '0xe67c773b9c68a6a863bba425e3d85c9e530f4df5';
const SUI_FANS_CHAT_ID_TESTNET = '0x1d813602114ed649de94649a9458e2c1f396c652';

export function getConfig(network: string): [JsonRpcProvider, string, string] {
    switch (network) {
        case 'devnet':
            return [RPC_DEVNET, POLYMEDIA_PACKAGE_DEVNET, SUI_FANS_CHAT_ID_DEVNET ];
        case 'testnet':
            return [RPC_TESTNET, POLYMEDIA_PACKAGE_TESTNET, SUI_FANS_CHAT_ID_TESTNET ];
        default:
            throw new Error('Invalid network: ' + network);
    }
}

export function isExpectedType(type: string, expectPackage: string, expectModule: string, expectType: string): boolean {
    // Handle missing leading zeros ('0x00ab::x::Y' is returned as '0xab::x::Y' by the RPC)
    const packageName = expectPackage.replace(/0x0+/, '0x0*');
    const typeRegex = new RegExp(`^${packageName}::${expectModule}::${expectType}`);
    return !!type.match(typeRegex);
}

/*
/// Represents a `polymedia_chat::item::Item` Sui object
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
    if (!isExpectedType(details.data.type, POLYMEDIA_CHAT_PACKAGE, 'item', 'Item')) {
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

/// Fetch and parse `polymedia_chat::item::Item` Sui objects
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
*/
