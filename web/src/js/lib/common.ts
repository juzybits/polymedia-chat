/// Miscellaneous convenience functions and constants

export function shorten(text: string, start: number, end: number, separator: string): string {
    return !text ? '' : text.slice(0, start) + separator + (end?text.slice(-end):'')
}

/// Transform an address like '0x123456789abc' into '@89abc'
export function shortenAddress(address: string): string {
    return '@' + shorten(address, 0, 5, '');
}
