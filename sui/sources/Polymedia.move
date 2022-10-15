module polymedia::polymedia
{
    use std::option::{Option};
    use std::string::{String};
    use sui::balance::{Balance};
    use sui::object::{UID};
    use sui::sui::{SUI};
    use sui::vec_map::{VecMap};

    /// Generic media item
    struct Item has key, store {
        id: UID,
        /// An Item belongs to a single Space. This can be used for things like:
        ///   - Determine where to send funds from ad payments and upvotes
        ///   - Use data from the parent Space, like ad configuration
        space: address,

        /// Generic data container
        data: Option<DataStore>,

        /* Media fields */

        /// The dominant media type in this Item. Examples:
        ///   long form text = 'post'
        ///   quick thought = 'chirp'
        ///   spotify.com = 'audio'
        ///   youtube.com = 'video'
        ///   pinterest.com = 'image'
        ///   media playlist = 'gallery'
        ///   reply to Item = 'comment'
        ///   advertisement = 'ad'
        media_type: String,
        /// The format of fields like `text` or `data` may evolve over time
        media_version: u64,

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

        /* Commerce fields */

        /// Ad configuration
        ads: Option<Ads>,

        /// How much SUI this Item costs to "buy now". 0 means not listed.
        price: u64,
        /// People can place an offer the Item, whether it's listed or not
        offers: vector<BuyOffer>,
        /// Minimum amount of SUI that someone can offer for this Item
        min_offer: u64,

        /* Social fields */

        /// How much SUI has been paid to like this Item
        upvoted: u64,
        /// How much SUI has been paid to dislike this Item
        downvoted: u64,
        /// List of 'comment' Item objects that replied to this Item
        /// Ideas:
        ///   - People can comment for free, but also add a tip. Then UI sorts comments by `tip_size + upvoted - downvoted`
        ///   - Add MAX_COMMENTS. When reached, people must pay to comment (this will delete lower-value comments by pricing them out).
        comments: vector<address>,

        /* Ideas */

        // markup language used in the Item.text field
        // markup: String, // (MAYBE) plaintext, html, markdown, asciiDoc, textile
        // CSS rules
        // styles: Option<CssStyles>,
    }

    /// Container for Item objects
    struct Space has key, store {
        id: UID,
        /// A Space belongs to a single Account
        account: address,
        /// To describe this Space as a media Item
        config: Item,
        /// To define default values for children Items
        defaults: Item,
        /// Item objects created from this Space
        items: vector<address>,
    }

    /// Container for Space objects
    struct Account has key, store {
        id: UID,
        /// An Account belongs to a single address
        owner: address, // MAYBE: consider using OwnerCapability: https://github.com/MystenLabs/sui/blob/aba2cca6cedcf1aa05d266a94f8dac68106dba42/crates/sui-framework/sources/safe.move#L91
        /// An Item that describes this Account and defines default values for ads/data/etc
        config: Item,
        /// Space objects created from this Account
        spaces: vector<address>,
        // bookmarks: vector<address>,
    }

    /// Generic data container
    struct DataStore has store {
        strings: VecMap<String, vector<String>>,
    }

    /* Ads */

    /// Ad management
    struct Ads has store {
        enabled: bool,
        /// Ad slot configuration. Keys are slot names.
        slot_conf: VecMap<String, SlotConf>,
        /// Ad slot contents. Keys are slot names.
        slot_data: VecMap<String, SlotData>,
    }
    /// Ad slot configuration
    struct SlotConf has store {
        price: u64,
        max_days: u64,
    }
    /// Ad slot contents
    struct SlotData has store {
        /// List of 'ad' Items in this slot
        ad_items: vector<address>,
        start_epochs: vector<u64>,
        end_epochs: vector<u64>,
    }

    /* Commerce */

    /// An offer to buy an object for an amount of SUI
    struct BuyOffer has store {
        balance: Balance<SUI>,
        object: address,
        buyer: address,
    }
}

/*
    /// A collection of CSS rules
    struct CssStyles {
        styles: VecMap<String, CssRules>, // <'#css.selector', CssRules>
    }
    struct CssRules {
        properties: vector<String>,
        values: vector<String>,
    }
*/
