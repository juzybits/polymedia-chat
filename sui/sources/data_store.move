module polymedia::data_store
{
    use std::string::{String};
    use sui::vec_map::{Self, VecMap};

    /// Generic data container
    struct DataStore has store {
        addresses: VecMap<address, address>,
        strings: VecMap<String, String>,
        u64s: VecMap<u64, u64>,
    }

    public fun create_empty(): DataStore {
        return DataStore {
            addresses: vec_map::empty(),
            strings: vec_map::empty(),
            u64s: vec_map::empty(),
        }
    }

    public fun create_from_vectors( // TODO
        _addresses_keys: vector<String>,
        _addresses_vals: vector<address>,
        _strings_keys: vector<String>,
        _strings_vals: vector<String>,
        _u64s_keys: vector<String>,
        _u64s_vals: vector<u64>
    ): DataStore {
        return create_empty()
    }

    // TODO: DataStore getters and setters

}
