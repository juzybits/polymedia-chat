module polymedia_chat::event_chat
{
    use std::string::{Self, String};
    use sui::event;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{TxContext};

    struct ChatRoom has key, store {
        id: UID,
        name: String,
        description: String,
    }

    struct MessageEvent has copy, drop {
        room: address,
        text: String,
    }

    public entry fun create_room(
        name: vector<u8>,
        description: vector<u8>,
        ctx: &mut TxContext)
    {
        let chat = ChatRoom {
            id: object::new(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
        };
        transfer::freeze_object(chat);
    }

    public entry fun send_message(
        room: &ChatRoom,
        text: vector<u8>,
        _ctx: &mut TxContext)
    {
        event::emit(MessageEvent {
            room: object::id_address(room),
            text: string::utf8(text),
        });
    }
}
