/// Helpers to parse/fetch/publish `polymedia_chat::item::Item` objects on the Sui network

import { Connection, JsonRpcProvider } from '@mysten/sui.js';

const POLYMEDIA_PACKAGE_DEVNET = '0x5c23a7d6416a0e7f62923f71fd6029ee5afe0983';
const SUI_FANS_CHAT_ID_DEVNET = '0xd4073fcc4639608b87f7cc1faa8cb6192d5a5af8';
const SUI_FANS_CHAT_ID_DEVNET_SPECIAL = '0x12f47a966773c6ec07a19fc95b856e285ba48cf5';

const POLYMEDIA_PACKAGE_TESTNET = '0x123';
const SUI_FANS_CHAT_ID_TESTNET = '0x456';
const SUI_FANS_CHAT_ID_TESTNET_SPECIAL = '0x789';

const FAUCET_DEVNET = 'https://faucet.devnet.sui.io/gas';
const FAUCET_TESTNET = 'https://faucet.testnet.sui.io/gas';

const RPC_DEVNET = new JsonRpcProvider(new Connection({
  fullnode: 'https://node.shinami.com/api/v1/186668da9c42b69678719e785ed644a2',
  // fullnode: 'https://fullnode.devnet.sui.io:443/',
  faucet: FAUCET_DEVNET,
}));

const RPC_TESTNET = new JsonRpcProvider(new Connection({
  // fullnode: '...',
  fullnode: 'https://fullnode.testnet.sui.io:443/',
  faucet: FAUCET_TESTNET,
}));

const RPC_DEVNET_WEBSOCKET = new JsonRpcProvider(new Connection({
    fullnode: 'wss://node.shinami.com/ws/v1/186668da9c42b69678719e785ed644a2',
    // fullnode: 'https://fullnode.devnet.sui.io:443/',
    faucet: FAUCET_DEVNET,
}));

const RPC_TESTNET_WEBSOCKET = new JsonRpcProvider(new Connection({ // TODO
    fullnode: '...',
    faucet: FAUCET_TESTNET,
}));


type Config = {
  rpc: JsonRpcProvider;
  rpcWebsocket: JsonRpcProvider;
  polymediaPackageId: string;
  suiFansChatId: string;
  suiFansChatIdSpecial: string;
};

export function getConfig(network: string): Config {
    switch (network) {
        case 'devnet':
            return {
                rpc: RPC_DEVNET,
                rpcWebsocket: RPC_DEVNET_WEBSOCKET,
                polymediaPackageId: POLYMEDIA_PACKAGE_DEVNET,
                suiFansChatId: SUI_FANS_CHAT_ID_DEVNET,
                suiFansChatIdSpecial: SUI_FANS_CHAT_ID_DEVNET_SPECIAL,
            };
        case 'testnet':
            return {
                rpc: RPC_TESTNET,
                rpcWebsocket: RPC_TESTNET_WEBSOCKET,
                polymediaPackageId: POLYMEDIA_PACKAGE_TESTNET,
                suiFansChatId: SUI_FANS_CHAT_ID_TESTNET,
                suiFansChatIdSpecial: SUI_FANS_CHAT_ID_TESTNET_SPECIAL,
            };
        default:
            throw new Error('Invalid network: ' + network);
    }
}

/*

export function isExpectedType(type: string, expectPackage: string, expectModule: string, expectType: string): boolean {
    // Handle missing leading zeros ('0x00ab::x::Y' is returned as '0xab::x::Y' by the RPC)
    const packageName = expectPackage.replace(/0x0+/, '0x0*');
    const typeRegex = new RegExp(`^${packageName}::${expectModule}::${expectType}`);
    return !!type.match(typeRegex);
}

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
    return rpcPrivate.getObjectBatch(objectIds)
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
