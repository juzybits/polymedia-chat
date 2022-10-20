module polymedia::item
{
    use std::string::{Self, String};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use polymedia::data_store::{Self, DataStore};

    /// Generic media item
    struct Item has key, store {
        id: UID,
        owner: address, // TODO: use OwnerCap instead
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
        media_type: String,
        /// Semantic versioning (the format of Item fields like `data` may evolve over time)
        media_version: String,
        /// A title or identifier
        name: String,
        /// Longer text like a description or an article body
        text: String,
        /// The main URL for this resource (e.g. the 'src' in <img> or <video>)
        url: String,
        /// Banner image URL
        banner: String,
        /// Thumbnail image URL
        thumbnail: String,
        /// Generic data container
        data: DataStore,
    }

    public entry fun create(
        media_type: vector<u8>,
        media_version: u64,
        name: vector<u8>,
        text: vector<u8>,
        url: vector<u8>,
        banner: vector<u8>,
        thumbnail: vector<u8>,
        addresses_keys: vector<String>,
        addresses_vals: vector<address>,
        strings_keys: vector<String>,
        strings_vals: vector<String>,
        u64s_keys: vector<String>,
        u64s_vals: vector<u64>,
        ctx: &mut TxContext)
    {
        let item = Item {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            media_type: string::utf8(media_type),
            media_version: media_version,
            name: string::utf8(name),
            text: string::utf8(text),
            url: string::utf8(url),
            banner: string::utf8(banner),
            thumbnail: string::utf8(thumbnail),
            data: data_store::create_from_vectors(addresses_keys, addresses_vals, strings_keys, strings_vals, u64s_keys, u64s_vals),
        };
        transfer::share_object(item);
    }

}
