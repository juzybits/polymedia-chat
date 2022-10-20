/// DEV_ONLY To keep track of potential features
module polymedia::ideas
{
    use std::option::{Option};
    use std::string::{String};
    use sui::balance::{Balance};
    use sui::object::{UID};
    use sui::coin::{Coin};
    use sui::sui::{SUI};
    use sui::vec_map::{VecMap};

    /// Generic media item
    struct Item has key, store {
        id: UID,
        /// An Item belongs to a single Space. This can be used for things like:
        ///   - Determine where to send funds from ad payments and upvotes
        ///   - Use data from the Space, like ad configuration
        space: address,

        /// Ad configuration
        ads: Option<Ads>,

        /// List of 'comment' Items that replied to this Item. Ideas:
        ///   - People can comment for free, but also add a tip. Then UIs can sort the comments by tip size.
        ///   - Add MAX_COMMENTS. When reached, people must pay to comment (this will delete lower-value comments by pricing them out).
        comments: vector<address>,

        /// How much SUI has been paid to like this Item
        upvoted: u64,
        /// How much SUI has been paid to dislike this Item
        downvoted: u64,

        /// How much SUI this Item costs to "buy now". 0 means not listed.
        price: u64,
        /// People can place an offer the Item, whether it's listed or not
        offers: vector<BuyOffer>,
        /// Minimum amount of SUI that someone can offer for this Item
        min_offer: u64,

        /// markup language used in the Item.text field
        markup: String, // (MAYBE) plaintext, html, markdown, asciiDoc, textile

        /// CSS rules
        styles: Option<CssStyles>,
    }

    public entry fun place_ad(_host_item: &Item, _ad_item: &Item, _slot: String, _start_epoch: u64, _end_epoch: u64, _coin: Coin<SUI>, _amount: u64) { abort(0) }

    /// Container for Items
    struct Space has key, store {
        id: UID,
        owner: address,
        /// To describe this Space as a media Item
        config: Item,
        /// To define default values for children Items
        defaults: Item,
        /// Items created from this Space
        items: vector<address>,
    }

    /// Container for Space objects
    struct Account has key, store {
        id: UID,
        /// An Account belongs to a single address
        owner: address, // MAYBE: consider using OwnerCapability: https://github.com/MystenLabs/sui/blob/aba2cca6cedcf1aa05d266a94f8dac68106dba42/crates/sui-framework/sources/safe.move#L91
        /// An Item that describes this Account and defines default values for ads/data/etc
        config: Item,
        /// Space objects created from this Account, organized by tag/collection name
        spaces: VecMap<String, address>,
        /* Ideas
        bookmarks: vector<address>,
        */
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

    /* Display */

    /// A collection of CSS rules
    struct CssStyles has store {
        styles: VecMap<String, CssRules>, // <'#css.selector', CssRules>
    }
    struct CssRules has store {
        properties: vector<String>,
        values: vector<String>,
    }

}
