// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title BaseGenesisNFT
 * @dev NFT contract for BaseGenesis - commemorating users' first transaction on Base
 * @notice Mint price is ~$1 in ETH, sent directly to treasury
 */
contract BaseGenesisNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    using Strings for uint256;

    uint256 private _tokenIdCounter;
    uint256 public mintPrice = 0.0003 ether; // ~$1 at current ETH prices
    address public treasury;
    
    // Mapping to track if an address has already minted
    mapping(address => bool) public hasMinted;
    
    // Struct to store NFT metadata
    struct GenesisData {
        string rank;           // GENESIS PIONEER, EARLY SETTLER, BASE CITIZEN
        uint256 daysSince;     // Days since first tx
        uint256 firstBlock;    // First transaction block number
        string firstTxHash;    // First transaction hash
        uint256 mintedAt;      // Timestamp when minted
    }
    
    mapping(uint256 => GenesisData) public tokenData;

    // Events
    event GenesisMinted(address indexed minter, uint256 indexed tokenId, string rank);
    event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event TreasuryUpdated(address oldTreasury, address newTreasury);

    constructor(address _treasury) ERC721("BaseGenesis", "BGEN") Ownable(msg.sender) {
        treasury = _treasury;
    }

    /**
     * @dev Mint a BaseGenesis NFT
     * @param rank The user's genesis rank
     * @param daysSince Days since first transaction
     * @param firstBlock First transaction block number
     * @param firstTxHash First transaction hash
     */
    function mint(
        string memory rank,
        uint256 daysSince,
        uint256 firstBlock,
        string memory firstTxHash
    ) external payable {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(!hasMinted[msg.sender], "Already minted");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        // Store genesis data
        tokenData[tokenId] = GenesisData({
            rank: rank,
            daysSince: daysSince,
            firstBlock: firstBlock,
            firstTxHash: firstTxHash,
            mintedAt: block.timestamp
        });
        
        hasMinted[msg.sender] = true;
        
        _safeMint(msg.sender, tokenId);
        
        // Send payment to treasury
        (bool success, ) = treasury.call{value: msg.value}("");
        require(success, "Transfer failed");
        
        emit GenesisMinted(msg.sender, tokenId, rank);
    }

    /**
     * @dev Generate on-chain SVG for the NFT
     */
    function generateSVG(uint256 tokenId) public view returns (string memory) {
        GenesisData memory data = tokenData[tokenId];
        
        string memory rankColor;
        string memory rankGradient;
        
        if (keccak256(bytes(data.rank)) == keccak256(bytes("GENESIS PIONEER"))) {
            rankColor = "#F59E0B";
            rankGradient = '<linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#FCD34D"/><stop offset="100%" style="stop-color:#F59E0B"/></linearGradient>';
        } else if (keccak256(bytes(data.rank)) == keccak256(bytes("EARLY SETTLER"))) {
            rankColor = "#06B6D4";
            rankGradient = '<linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#22D3EE"/><stop offset="100%" style="stop-color:#06B6D4"/></linearGradient>';
        } else {
            rankColor = "#64748B";
            rankGradient = '<linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#94A3B8"/><stop offset="100%" style="stop-color:#64748B"/></linearGradient>';
        }
        
        string memory shortHash = string(abi.encodePacked(
            _substring(data.firstTxHash, 0, 6),
            "...",
            _substring(data.firstTxHash, bytes(data.firstTxHash).length - 4, 4)
        ));
        
        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">',
            '<defs>', rankGradient, '</defs>',
            '<rect width="400" height="400" fill="#020205"/>',
            '<rect x="20" y="20" width="360" height="360" rx="20" fill="#0A0A0F" stroke="url(#grad)" stroke-width="2"/>',
            '<circle cx="340" cy="60" r="80" fill="', rankColor, '" opacity="0.1"/>',
            '<text x="40" y="60" font-family="monospace" font-size="10" fill="#666">BASEGENESIS</text>',
            '<text x="40" y="80" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff">ID SYSTEM</text>',
            '<text x="40" y="180" font-family="sans-serif" font-size="28" font-weight="bold" fill="url(#grad)">', data.rank, '</text>',
            '<text x="40" y="250" font-family="monospace" font-size="10" fill="#666">DAYS ON BASE</text>',
            '<text x="40" y="275" font-family="monospace" font-size="20" fill="#fff">', data.daysSince.toString(), '</text>',
            '<text x="200" y="250" font-family="monospace" font-size="10" fill="#666">FIRST BLOCK</text>',
            '<text x="200" y="275" font-family="monospace" font-size="20" fill="#fff">#', data.firstBlock.toString(), '</text>',
            '<text x="40" y="340" font-family="monospace" font-size="10" fill="#666">GENESIS TX</text>',
            '<text x="40" y="360" font-family="monospace" font-size="12" fill="#0052FF">', shortHash, '</text>',
            '<rect x="280" y="40" width="60" height="40" rx="5" fill="#1a1a2e" stroke="#333" stroke-width="1"/>',
            '</svg>'
        ));
    }

    /**
     * @dev Generate token URI with on-chain metadata
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        GenesisData memory data = tokenData[tokenId];
        string memory svg = generateSVG(tokenId);
        
        string memory json = Base64.encode(bytes(string(abi.encodePacked(
            '{"name": "BaseGenesis #', tokenId.toString(), '",',
            '"description": "BaseGenesis NFT - Commemorating your first transaction on Base blockchain. Rank: ', data.rank, '",',
            '"image": "data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '",',
            '"attributes": [',
                '{"trait_type": "Rank", "value": "', data.rank, '"},',
                '{"trait_type": "Days on Base", "value": ', data.daysSince.toString(), '},',
                '{"trait_type": "First Block", "value": ', data.firstBlock.toString(), '},',
                '{"trait_type": "Genesis TX", "value": "', data.firstTxHash, '"},',
                '{"trait_type": "Minted At", "display_type": "date", "value": ', data.mintedAt.toString(), '}',
            ']}'
        ))));
        
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    // Admin functions
    function setMintPrice(uint256 _newPrice) external onlyOwner {
        emit MintPriceUpdated(mintPrice, _newPrice);
        mintPrice = _newPrice;
    }

    function setTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid address");
        emit TreasuryUpdated(treasury, _newTreasury);
        treasury = _newTreasury;
    }

    function withdraw() external onlyOwner {
        (bool success, ) = treasury.call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }

    // Helper function to substring
    function _substring(string memory str, uint256 startIndex, uint256 length) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(length);
        for (uint256 i = 0; i < length; i++) {
            result[i] = strBytes[startIndex + i];
        }
        return string(result);
    }

    // Required overrides
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
