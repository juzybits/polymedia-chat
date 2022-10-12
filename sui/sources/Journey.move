module journey::journey
{
    use std::option::{Option};
    use std::string::{String};
    use sui::object::{ID};
    use sui::vec_map::{VecMap};

    /// Generic media item
    struct Item {
        /// Media type (e.g. chirp, post, image, audio, video, gallery)
        kind: String,
        /// The data format may change over time
        version: u64,
        /// A title or identifier
        name: String,
        /// Longer text like a description or a message body
        text: String,
        /// The main URL for this resource (e.g. the 'src' in <img> or <video>)
        url: String,
        /// Banner/thumbnail for social media
        image: String,
        /// Generic data container
        data: Option<DataStore>,
        /// CSS rules
        styles: Option<CssStyles>,
        /// Ad configuration
        ads: Option<Ads>,
        /// Parent object from which to inherit styles, ad configuration, etc
        /// Other uses: link back to parent gallery; show the parent playlist title from the children song Items
        parent: ID,

        // comments: ..., // (maybe) Ideas: People can comment for free but also tip. Comments sorted by tip size.
        // markup: String, // (maybe) plaintext, html, markdown, asciiDoc, textile
    }

    /// Generic data container
    struct DataStore {
        u64s: VecMap<String, vector<u64>>,
        strings: VecMap<String, vector<String>>,
        addresses: VecMap<String, vector<address>>,
    }

    /* CSS */

    /// A collection of CSS rules
    struct CssStyles {
        styles: VecMap<String, CssRules>, // <'#css.selector', CssRules>
    }
    struct CssRules {
        properties: vector<String>,
        values: vector<String>,
    }

    /* Ads */

    struct Ads {
        /// Ad slot configuration. Keys are slot names.
        slot_conf: VecMap<String, SlotConf>,
        /// Ad slot contents. Keys are slot names.
        slot_data: VecMap<String, SlotData>,
    }
    /// Ad slot configuration
    struct SlotConf {
        price: u64,
        max_days: u64,
    }
    /// Ad slot contents
    struct SlotData {
        ad_items: vector<ID>, // ads in this slot
        start_epochs: vector<u64>,
        end_epochs: vector<u64>,
    }
}
