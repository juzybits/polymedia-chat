/// Helpers to parse/fetch/publish `polymedia_chat::item::Item` objects on the Sui network

import { NetworkName } from '@polymedia/webutils';

const POLYMEDIA_PACKAGE_LOCALNET = '0xb0effff6ecd97100c8d08743ef133d00387c61a559d2eaedca6b808fe671fa6a';
const SUI_FANS_CHAT_ID_LOCALNET = '0x6313ac0fab76dcc38c75ef42fd1617599070e76a5c29ad72f65e1121b5dae220';

const POLYMEDIA_PACKAGE_DEVNET = '0x3e36cb11d01e891da2ca4d82afa740529aed7425c862f5a323bebf7696cd8b96';
const SUI_FANS_CHAT_ID_DEVNET = '0x3cd3ead8634aaa51a870c9f1b43e7980bd0d0593d503dd7cd3066af0d2e47438';

const POLYMEDIA_PACKAGE_TESTNET = '0xc3d40c8b1d7e8360c2b0046029a6ed597cffd538eca888e1d7ecc9d6760bb9df';
const SUI_FANS_CHAT_ID_TESTNET = '0x2c82d0dda82b799aaba1be2ca4c464a9502d75e5468d381ada7c26d9cae7c654';

const POLYMEDIA_PACKAGE_MAINNET = '0x9bccd22304e984ff1e565c2bd7ac8254b0ee2788190373daae33432ace873c18';
const SUI_FANS_CHAT_ID_MAINNET = '0x0b047c44f30a678e79ecd3122d6a80b585fdd2b583c4dae9d71b0d45501106b5';

/**
 * Represents a `polymedia_chat::event_chat::ChatRoom` Sui object
 */
export type ChatRoom = {
    id: string;
    name: string;
    description: string;
}

type Config = {
  polymediaPackageId: string;
  suiFansChatId: string;
};

export function getConfig(network: NetworkName): Config {
    switch (network) {
        case 'localnet':
            return {
                polymediaPackageId: POLYMEDIA_PACKAGE_LOCALNET,
                suiFansChatId: SUI_FANS_CHAT_ID_LOCALNET,
            };
        case 'devnet':
            return {
                polymediaPackageId: POLYMEDIA_PACKAGE_DEVNET,
                suiFansChatId: SUI_FANS_CHAT_ID_DEVNET,
            };
        case 'testnet':
            return {
                polymediaPackageId: POLYMEDIA_PACKAGE_TESTNET,
                suiFansChatId: SUI_FANS_CHAT_ID_TESTNET,
            };
        case 'mainnet':
            return {
                polymediaPackageId: POLYMEDIA_PACKAGE_MAINNET,
                suiFansChatId: SUI_FANS_CHAT_ID_MAINNET,
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
    return suiClient.getObjectBatch(objectIds)
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
