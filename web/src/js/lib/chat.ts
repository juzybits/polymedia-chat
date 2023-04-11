/// Helpers to parse/fetch/publish `polymedia_chat::item::Item` objects on the Sui network

import { NetworkName } from '@polymedia/webutils';

const POLYMEDIA_PACKAGE_LOCALNET = '0xb0effff6ecd97100c8d08743ef133d00387c61a559d2eaedca6b808fe671fa6a';
const SUI_FANS_CHAT_ID_LOCALNET = '0x6313ac0fab76dcc38c75ef42fd1617599070e76a5c29ad72f65e1121b5dae220';
const POLYMEDIA_PACKAGE_LOCALNET_SPECIAL = '0x123';
const SUI_FANS_CHAT_ID_LOCALNET_SPECIAL = '0x123';

const POLYMEDIA_PACKAGE_DEVNET = '0x94450fa90d53ac29c5d0f18008bcdc15e3c8b1cd92bc65e9cf762921dbb7e4b6';
const SUI_FANS_CHAT_ID_DEVNET = '0xf85fbad31fa0ebb6f0c471e61f4e59119315dcf29cd133e8328eead5889ae9c7';
const POLYMEDIA_PACKAGE_DEVNET_SPECIAL = '0x91c1316dbd38adbdd5e42e4e9e2c171fea406ae7df9b25efc720897230711f76';
const SUI_FANS_CHAT_ID_DEVNET_SPECIAL = '0xc9651b8146e04c32a1c9defd6b6a37b90a229c988c6f20c67de56267bb3c7b9f';

const POLYMEDIA_PACKAGE_TESTNET = '0xc3d40c8b1d7e8360c2b0046029a6ed597cffd538eca888e1d7ecc9d6760bb9df';
const SUI_FANS_CHAT_ID_TESTNET = '0xc3c6c048e848e2a05cc0cc425d4ca61db8296873da6e3d2b394680d6e445485b';
const POLYMEDIA_PACKAGE_TESTNET_SPECIAL = '0x123';
const SUI_FANS_CHAT_ID_TESTNET_SPECIAL = '0x789';

type Config = {
  polymediaPackageId: string;
  polymediaPackageIdSpecial: string;
  suiFansChatId: string;
  suiFansChatIdSpecial: string;
};

export function getConfig(network: NetworkName): Config {
    switch (network) {
        case 'localnet':
            return {
                polymediaPackageId: POLYMEDIA_PACKAGE_LOCALNET,
                polymediaPackageIdSpecial: POLYMEDIA_PACKAGE_LOCALNET_SPECIAL,
                suiFansChatId: SUI_FANS_CHAT_ID_LOCALNET,
                suiFansChatIdSpecial: SUI_FANS_CHAT_ID_LOCALNET_SPECIAL,
            };
        case 'devnet':
            return {
                polymediaPackageId: POLYMEDIA_PACKAGE_DEVNET,
                polymediaPackageIdSpecial: POLYMEDIA_PACKAGE_DEVNET_SPECIAL,
                suiFansChatId: SUI_FANS_CHAT_ID_DEVNET,
                suiFansChatIdSpecial: SUI_FANS_CHAT_ID_DEVNET_SPECIAL,
            };
        case 'testnet':
            return {
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
