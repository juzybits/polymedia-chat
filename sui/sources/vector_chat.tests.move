#[test_only]
module polymedia_chat::chat_tests
{
    use std::string::{Self};
    use std::vector;
    use sui::test_scenario::{Self as ts};
    use polymedia_chat::vector_chat::{Self, ChatRoom};

    /* Default values */

    const SOMEONE: address = @0x123;
    const CHAT_NAME: vector<u8> = b"The Chat Name";
    const CHAT_DESC: vector<u8> = b"The Chat Description";

    /* Tests */

    #[test]
    fun test_create_success()
    {
        let scen_val = ts::begin(SOMEONE);
        let scen = &mut scen_val;
        vector_chat::create( CHAT_NAME, CHAT_DESC, 3, 10, ts::ctx(scen) );
        ts::next_tx(scen, SOMEONE); {
            let room = ts::take_shared<ChatRoom>(scen);
            ts::return_shared(room);
        };
        ts::end(scen_val);
    }

    /* Test add_message() */

    fun assert_length(room: &ChatRoom, expected_length: u64)
    {
        assert!( vector::length(vector_chat::messages(room)) == expected_length, 0);
    }

    fun assert_index_has_message(room: &ChatRoom, index: u64, expected_message: vector<u8>)
    {
        let message = vector::borrow(vector_chat::messages(room), index);
        let message_text = *vector_chat::message_text( message );
        let expected_string = string::utf8(expected_message);
        assert!( message_text == expected_string, 0);
    }

    #[test]
    fun test_add_message()
    {
        let scen_val = ts::begin(SOMEONE);
        let scen = &mut scen_val;
        vector_chat::create( CHAT_NAME, CHAT_DESC, 3, 100, ts::ctx(scen) );
        ts::next_tx(scen, SOMEONE); {
            let room = ts::take_shared<ChatRoom>(scen);

            vector_chat::add_message( &mut room, 1001, b"message 1", ts::ctx(scen) );
            assert_length(&room, 1);

            vector_chat::add_message( &mut room, 1002, b"message 2", ts::ctx(scen) );
            assert_length(&room, 2);

            vector_chat::add_message( &mut room, 1003, b"message 3", ts::ctx(scen) );
            assert_length(&room, 3);

            // Test wrap-around
            vector_chat::add_message( &mut room, 1004, b"message 4", ts::ctx(scen) );
            assert_length(&room, 3); // length of chat.messages no longer increases
            assert_index_has_message(&room, 0, b"message 4"); // the 4th message is stored in index 0

            vector_chat::add_message( &mut room, 1005, b"message 5", ts::ctx(scen) );
            assert_length(&room, 3);
            assert_index_has_message(&room, 1, b"message 5");

            vector_chat::add_message( &mut room, 1006, b"message 6", ts::ctx(scen) );
            assert_length(&room, 3);
            assert_index_has_message(&room, 2, b"message 6");

            vector_chat::add_message( &mut room, 1007, b"message 7", ts::ctx(scen) );
            assert_length(&room, 3);
            assert_index_has_message(&room, 0, b"message 7");

            ts::return_shared(room);
        };
        ts::end(scen_val);
    }
}
