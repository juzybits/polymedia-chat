/// Helpers to parse/fetch/publish `polymedia_chat::item::Item` objects on the Sui network

import { Connection, JsonRpcProvider } from '@mysten/sui.js';
import { RPC_CONFIG } from '@polymedia/webutils';

const POLYMEDIA_PACKAGE_LOCALNET = '0xb0effff6ecd97100c8d08743ef133d00387c61a559d2eaedca6b808fe671fa6a';
const SUI_FANS_CHAT_ID_LOCALNET = '0x6313ac0fab76dcc38c75ef42fd1617599070e76a5c29ad72f65e1121b5dae220';
const POLYMEDIA_PACKAGE_LOCALNET_SPECIAL = '0x123';
const SUI_FANS_CHAT_ID_LOCALNET_SPECIAL = '0x123';

const POLYMEDIA_PACKAGE_DEVNET = '0x663365df8746f0730721a92588ddd771a8a9578106a162bd32a7f1d683cd1a62';
const SUI_FANS_CHAT_ID_DEVNET = '0xa03e781ab74a5ad813a3ea736508ad1fd285923fafb7895a7821a38bac0a632f';
const POLYMEDIA_PACKAGE_DEVNET_SPECIAL = '0x91c1316dbd38adbdd5e42e4e9e2c171fea406ae7df9b25efc720897230711f76';
const SUI_FANS_CHAT_ID_DEVNET_SPECIAL = '0xc9651b8146e04c32a1c9defd6b6a37b90a229c988c6f20c67de56267bb3c7b9f';

const POLYMEDIA_PACKAGE_TESTNET = '0xc3d40c8b1d7e8360c2b0046029a6ed597cffd538eca888e1d7ecc9d6760bb9df';
const SUI_FANS_CHAT_ID_TESTNET = '0xc3c6c048e848e2a05cc0cc425d4ca61db8296873da6e3d2b394680d6e445485b';
const POLYMEDIA_PACKAGE_TESTNET_SPECIAL = '0x123';
const SUI_FANS_CHAT_ID_TESTNET_SPECIAL = '0x789';

const RPC_LOCALNET = new JsonRpcProvider(new Connection({
    fullnode: RPC_CONFIG.LOCALNET_FULLNODE,
    faucet: RPC_CONFIG.LOCALNET_FAUCET,
}));

const RPC_DEVNET = new JsonRpcProvider(new Connection({
    // fullnode: 'https://node.shinami.com/api/v1/186668da9c42b69678719e785ed644a2',
    fullnode: RPC_CONFIG.DEVNET_FULLNODE,
    faucet: RPC_CONFIG.DEVNET_FAUCET,
}));

const RPC_DEVNET_WEBSOCKET = new JsonRpcProvider(new Connection({
    // fullnode: 'wss://node.shinami.com/ws/v1/186668da9c42b69678719e785ed644a2',
    fullnode: RPC_CONFIG.DEVNET_WEBSOCKET,
    faucet: RPC_CONFIG.DEVNET_FAUCET,
}));

const RPC_TESTNET = new JsonRpcProvider(new Connection({
    fullnode: RPC_CONFIG.TESTNET_FULLNODE,
    faucet: RPC_CONFIG.TESTNET_FAUCET,
}));

const RPC_TESTNET_WEBSOCKET = new JsonRpcProvider(new Connection({
    fullnode: RPC_CONFIG.TESTNET_WEBSOCKET,
    faucet: RPC_CONFIG.TESTNET_FAUCET,
}));

type Config = {
  rpc: JsonRpcProvider;
  rpcWebsocket: JsonRpcProvider;
  polymediaPackageId: string;
  polymediaPackageIdSpecial: string;
  suiFansChatId: string;
  suiFansChatIdSpecial: string;
};

export function getConfig(network: string): Config {
    switch (network) {
        case 'localnet':
            return {
                rpc: RPC_LOCALNET,
                rpcWebsocket: RPC_LOCALNET,
                polymediaPackageId: POLYMEDIA_PACKAGE_LOCALNET,
                polymediaPackageIdSpecial: POLYMEDIA_PACKAGE_LOCALNET_SPECIAL,
                suiFansChatId: SUI_FANS_CHAT_ID_LOCALNET,
                suiFansChatIdSpecial: SUI_FANS_CHAT_ID_LOCALNET_SPECIAL,
            };
        case 'devnet':
            return {
                rpc: RPC_DEVNET,
                rpcWebsocket: RPC_DEVNET_WEBSOCKET,
                polymediaPackageId: POLYMEDIA_PACKAGE_DEVNET,
                polymediaPackageIdSpecial: POLYMEDIA_PACKAGE_DEVNET_SPECIAL,
                suiFansChatId: SUI_FANS_CHAT_ID_DEVNET,
                suiFansChatIdSpecial: SUI_FANS_CHAT_ID_DEVNET_SPECIAL,
            };
        case 'testnet':
            return {
                rpc: RPC_TESTNET,
                rpcWebsocket: RPC_TESTNET_WEBSOCKET,
                polymediaPackageId: POLYMEDIA_PACKAGE_TESTNET,
                polymediaPackageIdSpecial: POLYMEDIA_PACKAGE_TESTNET_SPECIAL,
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
