import {
    Aptos,
    AptosConfig,
    Network,
    Account,
    Ed25519PrivateKey,
    AccountAddress,
    createObjectAddress,
} from "@aptos-labs/ts-sdk";

// ===== CONFIG =====
const PRIVATE_KEY =
    "0x8951a38dd8b4db405a1b54029e979a225479d4fc0566a595d3e7c7a7e2142704"; // thay key của mày vào đây
const AMOUNT_USDC = 500_000_000; // 500 USDC (6 decimals). Max mày thử tùy rate limit

// ===== SETUP =====
const PACKAGE =
    "0x952535c3049e52f195f26798c2f1340d7dd5100edbe0f464e520a974d16fbe9f";

const USDC_METADATA = createObjectAddress(
    AccountAddress.fromString(PACKAGE),
    new TextEncoder().encode("USDC"),
).toString();

const aptos = new Aptos(new AptosConfig({ network: Network.TESTNET }));

const account = Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey(PRIVATE_KEY),
});

// ===== MINT =====
async function mintUSDC() {
    console.log("Wallet address:", account.accountAddress.toString());
    console.log(`Minting ${AMOUNT_USDC / 1_000_000} USDC...`);

    const tx = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
            function: `${PACKAGE}::usdc::restricted_mint`,
            typeArguments: [],
            functionArguments: [AMOUNT_USDC],
        },
    });

    const result = await aptos.signAndSubmitTransaction({
        signer: account,
        transaction: tx,
    });

    console.log("Tx submitted:", result.hash);

    await aptos.waitForTransaction({ transactionHash: result.hash });
    console.log("✅ Minted successfully!");
    console.log(
        `🔗 https://explorer.aptoslabs.com/txn/${result.hash}?network=testnet`,
    );
}

mintUSDC().catch(console.error);
