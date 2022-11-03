/// A simple message board
module polymedia::chat
{
    use std::string::{Self, String};
    use std::vector;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    const E_INVALID_MAX_SIZE: u64 = 100;
    const E_INVALID_MAX_LENGTH: u64 = 101;
    const E_INVALID_TEXT_LENGTH: u64 = 102;

    struct Chat has key, store {
        id: UID,
        max_size: u64, // max amount of messsages
        max_length: u64, // max message length
        messages: vector<Message>,
    }

    struct Message has store, drop {
        author: address,
        text: String,
    }

    public entry fun create(max_size: u64, max_length: u64, ctx: &mut TxContext)
    {
        assert!(max_size > 0, E_INVALID_MAX_SIZE);
        assert!(max_length > 0, E_INVALID_MAX_LENGTH);
        let chat = Chat {
            id: object::new(ctx),
            max_size,
            max_length,
            messages: vector::empty(),
        };
        transfer::share_object(chat);
    }

    public entry fun add_message(chat: &mut Chat, text: vector<u8>, ctx: &mut TxContext)
    {
        let text_len = vector::length(&text);
        assert!(text_len > 0 && text_len <= chat.max_length, E_INVALID_TEXT_LENGTH);
        if (vector::length(&chat.messages) == chat.max_size) {
            vector::remove(&mut chat.messages, 0);
        };
        let newMessage = Message {
            author: tx_context::sender(ctx),
            text: string::utf8(text),
        };
        vector::push_back(&mut chat.messages, newMessage);
    }
}
