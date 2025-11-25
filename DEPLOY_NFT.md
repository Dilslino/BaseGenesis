# BaseGenesis NFT Deployment Guide

## Smart Contract Details

- **Contract**: `contracts/BaseGenesisNFT.sol`
- **Network**: Base Mainnet (Chain ID: 8453)
- **Treasury**: `0x0b7241893f2f6fBD71F5af6E09D896d190E5C339`
- **Mint Price**: 0.0003 ETH (~$1)

## Deployment Steps

### Option 1: Using Remix (Easiest)

1. Go to https://remix.ethereum.org
2. Create new file `BaseGenesisNFT.sol` and paste the contract code
3. In Compiler tab:
   - Select Solidity version `0.8.20`
   - Enable optimization (200 runs)
   - Compile
4. In Deploy tab:
   - Environment: "Injected Provider - MetaMask"
   - Make sure MetaMask is on Base network
   - Contract: `BaseGenesisNFT`
   - Constructor args: `0x0b7241893f2f6fBD71F5af6E09D896d190E5C339`
   - Click Deploy
5. Confirm transaction in MetaMask
6. Copy the deployed contract address

### Option 2: Using Foundry

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install OpenZeppelin
forge install OpenZeppelin/openzeppelin-contracts

# Deploy
forge create --rpc-url https://mainnet.base.org \
  --private-key YOUR_PRIVATE_KEY \
  contracts/BaseGenesisNFT.sol:BaseGenesisNFT \
  --constructor-args 0x0b7241893f2f6fBD71F5af6E09D896d190E5C339
```

### Option 3: Using Hardhat

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
# Copy contract to contracts/
npx hardhat run scripts/deploy.js --network base
```

## After Deployment

1. **Update Contract Address**
   Edit `config/wagmi.ts`:
   ```typescript
   export const NFT_CONTRACT_ADDRESS = '0xYOUR_DEPLOYED_ADDRESS' as const;
   ```

2. **Verify on Basescan**
   ```bash
   # Using Foundry
   forge verify-contract \
     --chain-id 8453 \
     --compiler-version v0.8.20 \
     YOUR_CONTRACT_ADDRESS \
     contracts/BaseGenesisNFT.sol:BaseGenesisNFT \
     --constructor-args $(cast abi-encode "constructor(address)" 0x0b7241893f2f6fBD71F5af6E09D896d190E5C339)
   ```
   
   Or via Basescan UI: https://basescan.org/verifyContract

3. **Setup OpenSea**
   - NFTs will automatically appear on OpenSea once minted
   - Collection URL: `https://opensea.io/collection/basegenesis`
   - Edit collection metadata at: https://opensea.io/collection/basegenesis/edit

## Contract Features

### For Users:
- `mint(rank, daysSince, firstBlock, firstTxHash)` - Mint NFT (costs 0.0003 ETH)
- `hasMinted(address)` - Check if address has already minted
- `tokenData(tokenId)` - Get NFT metadata
- `tokenURI(tokenId)` - Get full on-chain metadata (SVG + JSON)

### For Owner:
- `setMintPrice(newPrice)` - Update mint price
- `setTreasury(newAddress)` - Change treasury address
- `withdraw()` - Withdraw any stuck funds

## Revenue Flow

1. User clicks "Mint Genesis NFT"
2. User approves 0.0003 ETH transaction in wallet
3. Smart contract mints NFT to user
4. 0.0003 ETH sent directly to treasury: `0x0b7241893f2f6fBD71F5af6E09D896d190E5C339`

## OpenSea Integration

The NFT is fully compatible with OpenSea:
- On-chain SVG image (no IPFS needed)
- On-chain metadata with attributes
- ERC-721 compliant
- Royalties can be set via OpenSea's creator tools

### Suggested Royalties
- Set 5-10% royalty on OpenSea
- Royalty address: `0x0b7241893f2f6fBD71F5af6E09D896d190E5C339`

## Testing (Before Mainnet)

Deploy to Base Sepolia testnet first:
- RPC: `https://sepolia.base.org`
- Chain ID: 84532
- Faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
