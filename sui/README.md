# Polymedia Chat

## Development setup
1. [Install Sui](https://docs.sui.io/build/install#install-sui-binaries)
```
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch devnet sui sui-node
```
2. Connect to devnet:
```
sui client switch --env devnet
```

## Publish the package
```
sui client publish --verify-dependencies --gas-budget 30000
```

## How to use from `sui console`
#### Create a chat
```
call --package PACKAGE_ID --module chat --function create --args 'Sui fans' 'A place to talk about all things Sui 🌊' 150 500 --gas-budget 1000
```
