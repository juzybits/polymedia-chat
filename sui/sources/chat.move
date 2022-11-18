/// A simple message board
module polymedia::chat
{
    use std::string::{Self, String};
    use std::vector;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    const E_INVALID_MAX_MSG_AMOUNT: u64 = 100;
    const E_INVALID_MAX_MSG_LENGTH: u64 = 101;
    const E_INVALID_TEXT_LENGTH: u64 = 102;

    struct ChatRoom has key, store {
        id: UID,
        name: String, // name/title
        description: String, // description/rules/welcome message/etc
        max_msg_amount: u64, // maximum amount of messages this chat room can hold
        max_msg_length: u64, // maximum length (in characters) of any given chat message
        messages: vector<ChatMessage>,
    }

    struct ChatMessage has store, drop {
        author: address,
        text: String,
    }

    public entry fun create(
        name: vector<u8>,
        description: vector<u8>,
        max_msg_amount: u64,
        max_msg_length: u64,
        ctx: &mut TxContext)
    {
        assert!(max_msg_amount >= 10 && max_msg_amount <= 200, E_INVALID_MAX_MSG_AMOUNT);
        assert!(max_msg_length >= 10 && max_msg_length <= 1000, E_INVALID_MAX_MSG_LENGTH);
        let chat = ChatRoom {
            id: object::new(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            max_msg_amount,
            max_msg_length,
            messages: vector::empty(),
        };
        transfer::share_object(chat);
    }

    public entry fun add_message(chat: &mut ChatRoom, text: vector<u8>, ctx: &mut TxContext)
    {
        let text_len = vector::length(&text);
        assert!(text_len > 0 && text_len <= chat.max_msg_length, E_INVALID_TEXT_LENGTH);
        if (vector::length(&chat.messages) == chat.max_msg_amount) {
            vector::remove(&mut chat.messages, 0);
        };
        let newMessage = ChatMessage {
            author: tx_context::sender(ctx),
            text: string::utf8(text),
        };
        vector::push_back(&mut chat.messages, newMessage);
    }
}
