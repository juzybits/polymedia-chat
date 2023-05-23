# Polymedia Chat

## Publish the package
```
sui client publish --gas-budget 100000000 | grep packageId
```

## How to use from `sui console`

### vector_chat
#### Create a chat room
```
sui client call --package PACKAGE_ID --module vector_chat --function create --args 'Sui fans' 'A place to talk about all things Sui 🌊' \"120\" \"1000\" --gas-budget 1000
```

#### Send a message
```
sui client call --package PACKAGE_ID --module vector_chat --function add_message --args CHAT_ID '1674703217259' 'testing from command line' --gas-budget 10000
```

### event_chat
#### Create a chat room
```
sui client call --package PACKAGE_ID --module event_chat --function create_room --args 'Sui fans' 'A place to talk about all things Sui 🌊' --gas-budget 10000
```

#### Send a message
```
sui client call --package PACKAGE_ID --module event_chat --function send_message --args CHAT_ID 'testing from command line' --gas-budget 1000
```
