module polymedia::item
{
    use std::string::{Self, String};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{TxContext};

    /// Generic media item
    struct Item has key, store {
        id: UID,
        account: address,
        /// The dominant media type in this Item. Examples:
        ///   'ad': advertisement that can be embedded in other Items
        ///   'audio': link to spotify.com, yoursite.com/song.mp3
        ///   'chirp': short text similar to twitter.com
        ///   'comment': reply to an Item
        ///   'gallery': media playlist
        ///   'image': link to pinterest.com, flickr.com, imgur.com
        ///   'post': long form text
        ///   'resume': curriculum vitae
        ///   'video': link to youtube.com, vimeo.com, yoursite.com/movie.mp4
        kind: String,
        /// Semantic versioning (the format of Item fields like `data` may evolve over time)
        version: String,
        /// A title or identifier
        name: String,
        /// Longer text like a description or an article body
        text: String,
        /// The main URL for this resource (e.g. the 'src' in <img> or <video>)
        url: String,
        /// Generic data container. For example, JSON could be stored here.
        data: String,
    }

    public entry fun create(
        kind: vector<u8>,
        account: address,
        version: vector<u8>,
        name: vector<u8>,
        text: vector<u8>,
        url: vector<u8>,
        data: vector<u8>,
        ctx: &mut TxContext)
    {
        let item = Item {
            id: object::new(ctx),
            account: account,
            kind: string::utf8(kind),
            version: string::utf8(version),
            name: string::utf8(name),
            text: string::utf8(text),
            url: string::utf8(url),
            data: string::utf8(data),
        };
        transfer::share_object(item);
    }

}
