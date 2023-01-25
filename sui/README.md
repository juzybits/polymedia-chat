# Polymedia Chat

## Development setup
1. [Install Sui](https://docs.sui.io/build/install#install-sui-binaries)
```
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch devnet sui
```
2. Connect to devnet:
```
sui client switch --env devnet
```

## Publish the package
```
sui client publish --gas-budget 30000
```

## How to use from `sui console`
#### Create a chat room
```
call --package PACKAGE_ID --module chat --function create --args 'Sui fans' 'A place to talk about all things Sui 🌊' \"150\" \"500\" --gas-budget 1000
```

#### Send a chat message
```
call --package PACKAGE_ID --module chat --function add_message --args CHAT_ID '1674703217259' 'testing from command line' --gas-budget 1000
```
