# Polymedia Sui package

## Development setup
1. [Install Sui](https://docs.sui.io/build/install#install-sui-binaries)
```
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch devnet sui sui-node
```
2. Connect to devnet:
```
sui client switch --rpc https://fullnode.devnet.sui.io:443
```

## Publish the package
```
sui client publish --gas-budget 30000
```
