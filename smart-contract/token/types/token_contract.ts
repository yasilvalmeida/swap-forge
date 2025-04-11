/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/token_contract.json`.
 */
export type TokenContract = {
  "address": "BydD8yQtb1kWB7WUnzzq9KduCDzSvUUi1nuoz9wHDM1X",
  "metadata": {
    "name": "tokenContract",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Swapforge Token Contract"
  },
  "instructions": [
    {
      "name": "createToken",
      "docs": [
        "Creates a new token with metadata"
      ],
      "discriminator": [
        84,
        52,
        204,
        228,
        24,
        140,
        234,
        75
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "treasury",
          "writable": true,
          "address": "DW69JZRd1j3Y2DsEhF2biwk3DPdn6BLeG51AFXg18ho2"
        },
        {
          "name": "mint",
          "writable": true,
          "signer": true
        },
        {
          "name": "metadata",
          "writable": true
        },
        {
          "name": "tokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "sysvarInstructions",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenMetadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "decimals",
          "type": "u8"
        },
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "initialSupply",
          "type": "u64"
        },
        {
          "name": "revokeMint",
          "type": "bool"
        },
        {
          "name": "revokeFreeze",
          "type": "bool"
        },
        {
          "name": "revokeUpdate",
          "type": "bool"
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorizedTreasury",
      "msg": "Unauthorized Treasury"
    },
    {
      "code": 6001,
      "name": "insufficientFunds",
      "msg": "Insufficient funds"
    },
    {
      "code": 6002,
      "name": "invalidFeeCalculation",
      "msg": "Invalid fee calculation"
    },
    {
      "code": 6003,
      "name": "invalidMetadataAccount",
      "msg": "Invalid token account owner"
    },
    {
      "code": 6004,
      "name": "invalidTokenName",
      "msg": "Invalid token name"
    },
    {
      "code": 6005,
      "name": "invalidTokenSymbol",
      "msg": "Invalid token symbol"
    },
    {
      "code": 6006,
      "name": "invalidDecimals",
      "msg": "Invalid decimals"
    },
    {
      "code": 6007,
      "name": "invalidUri",
      "msg": "Invalid URI"
    },
    {
      "code": 6008,
      "name": "invalidInitialSupply",
      "msg": "Invalid initial supply"
    }
  ]
};
