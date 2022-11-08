/// Miscellaneous convenience functions and constants

/// Transform a long string like "startXXXXXXend" into "start...end"
export function shorten(text: string, start=5, end=3, separator='...'): string {
    return !text ? '' : text.slice(0, start) + separator + (end?text.slice(-end):'')
}
