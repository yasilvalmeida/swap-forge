/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/token_contract.json`.
 */
export type TokenContract = {
  "address": "AkugdJHDjDvBaxUGC6pjyrfqEpDfJ4Z9Ji9NED6Lmddg",
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
          "name": "deployer",
          "writable": true,
          "signer": true
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
          "name": "sysvarInstructions"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenMetadataProgram"
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
    },
    {
      "name": "initializeSecurity",
      "docs": [
        "Initializes program security settings (call once after deployment)"
      ],
      "discriminator": [
        34,
        18,
        166,
        159,
        18,
        55,
        139,
        139
      ],
      "accounts": [
        {
          "name": "security",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  45,
                  115,
                  101,
                  99,
                  117,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "upgradeSecurity",
      "docs": [
        "Updates security settings (admin only)"
      ],
      "discriminator": [
        212,
        116,
        192,
        162,
        225,
        25,
        4,
        127
      ],
      "accounts": [
        {
          "name": "security",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  45,
                  115,
                  101,
                  99,
                  117,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "newTxt",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "programSecurity",
      "discriminator": [
        198,
        90,
        128,
        76,
        164,
        62,
        91,
        221
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "Unauthorized: Signer does not have admin privileges"
    },
    {
      "code": 6001,
      "name": "insufficientFunds",
      "msg": "Insufficient funds for transaction"
    },
    {
      "code": 6002,
      "name": "alreadyInitialized",
      "msg": "Security account already initialized"
    }
  ],
  "types": [
    {
      "name": "programSecurity",
      "docs": [
        "Security account data"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u32"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "securityTxt",
            "type": "string"
          },
          {
            "name": "lastUpdated",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
