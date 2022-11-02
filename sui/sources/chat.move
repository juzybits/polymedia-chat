/// A simple message board
module polymedia::chat
{
    use std::string::{Self, String};
    use std::vector;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{TxContext};

    const E_INVALID_MAX_SIZE: u64 = 100;
    const E_INVALID_TEXT_LENGTH: u64 = 101;

    struct Chat has key, store {
        id: UID,
        max_size: u64,
        messages: vector<String>,
    }

    public entry fun create(max_size: u64, ctx: &mut TxContext)
    {
        assert!(max_size > 0, E_INVALID_MAX_SIZE);
        let chat = Chat {
            id: object::new(ctx),
            max_size,
            messages: vector::empty(),
        };
        transfer::share_object(chat);
    }

    public entry fun add_message(chat: &mut Chat, text: vector<u8>, _ctx: &mut TxContext)
    {
        assert!(vector::length(&text) > 0, E_INVALID_TEXT_LENGTH);
        if (vector::length(&chat.messages) == chat.max_size) {
            vector::remove(&mut chat.messages, 0);
        };
        vector::push_back(&mut chat.messages, string::utf8(text));
    }
}
