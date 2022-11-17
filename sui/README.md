# Polymedia Sui package

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
sui client publish --gas-budget 30000
```

## How to use from `sui console`
#### Create a chat
```
call --package PACKAGE_ID --module chat --function create --args 'Got Beef?' 'Find players or judges to make bets on https://gotbeef.app' 100 512 --gas-budget 1000
```
