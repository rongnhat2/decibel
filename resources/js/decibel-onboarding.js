import {
    Aptos,
    AptosConfig,
    Network,
    AccountAddress,
} from "@aptos-labs/ts-sdk";

import { getAptosWallets } from "@aptos-labs/wallet-standard";

const NETWORK = "mainnet";

// ===== APTOS CLIENT =====
function getAptosClient() {
    const config = new AptosConfig({
        network: NETWORK === "mainnet" ? Network.MAINNET : Network.TESTNET,
    });
    return new Aptos(config);
}

// ===== PETRA =====
async function getPetraWallet() {
    return new Promise((resolve) => {
        const { aptosWallets, on } = getAptosWallets();
        const found = aptosWallets.find((w) => w.name === "Petra");
        if (found) return resolve(found);

        const timer = setTimeout(() => resolve(null), 5000);
        on("register", (w) => {
            if (w.name === "Petra") {
                clearTimeout(timer);
                resolve(w);
            }
        });
    });
}

async function getWalletAddress() {
    const address =
        document.getElementById("onboarding-steps")?.dataset?.walletAddress;
    if (!address) throw new Error("Missing wallet address");
    return address;
}

function csrf() {
    return document.querySelector('meta[name="csrf-token"]')?.content ?? "";
}

async function postJson(url, payload) {
    const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-CSRF-TOKEN": csrf(),
        },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Request failed");
    return data;
}

// ===== SIGN AND SUBMIT using Petra Wallet Standard =====
async function signAndSubmit(aptos, petra, senderAddress, payload) {
    const txn = await aptos.transaction.build.simple({
        sender: senderAddress,
        data: payload,
        options: {
            maxGasAmount: 1000, // ← giảm từ default xuống
            gasUnitPrice: 100,
        },
    });

    const signFeature = petra.features["aptos:signTransaction"];
    const signResponse = await signFeature.signTransaction(txn);

    console.log("signResponse:", signResponse);
    console.log("args:", signResponse?.args);
    console.log("args constructor:", signResponse?.args?.constructor?.name);

    // Use ts-sdk submit the correct way
    const pendingTx = await aptos.transaction.submit.simple({
        transaction: txn,
        senderAuthenticator: signResponse?.args ?? signResponse,
    });

    console.log("pendingTx:", pendingTx);

    const committed = await aptos.waitForTransaction({
        transactionHash: pendingTx.hash,
        options: { checkSuccess: true },
    });

    return { hash: pendingTx.hash, result: committed };
}

async function stepApproveBuilderFee(
    aptos,
    petra,
    senderAddress,
    subaccountAddress,
    builderAddress,
    maxFeeBps,
) {
    const payload = {
        function: `0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::approve_max_builder_fee_for_subaccount`,
        typeArguments: [],
        functionArguments: [
            AccountAddress.from(subaccountAddress), // ← wrap with AccountAddress
            AccountAddress.from(builderAddress), // ← wrap with AccountAddress
            BigInt(maxFeeBps),
        ],
    };

    return signAndSubmit(aptos, petra, senderAddress, payload);
}

// ===== STEP 2: DELEGATE TRADING =====
async function stepDelegateTrading(
    aptos,
    petra,
    senderAddress,
    subaccountAddress,
    botKeyAddress,
) {
    const payload = {
        function: `0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::delegate_trading_to_for_subaccount`,
        typeArguments: [],
        functionArguments: [subaccountAddress, botKeyAddress, null],
    };

    return signAndSubmit(aptos, petra, senderAddress, payload);
}

// ===== MAIN =====
export async function runOnboarding({
    builderAddress,
    maxFeeBps = 7,
    startStep = 1,
    onStep = (data) => console.log(data),
    onSuccess = (data) => console.log("Done:", data),
    onError = (err) => console.error(err),
    onWaitForGas, // ← callback mới
} = {}) {
    if (!builderAddress) throw new Error("builderAddress is required");

    const aptos = getAptosClient();

    try {
        const senderAddress = await getWalletAddress();

        // Step 0: Laravel creates bot_key + redeem referral
        onStep({
            step: 0,
            state: "loading",
            message: "Initializing account...",
        });
        const { bot_key_address, subaccount_address } = await postJson(
            "/api/onboarding/bot-key",
            { wallet_address: senderAddress },
        );
        // STOP HERE — wait for user to deposit APT
        if (onWaitForGas) {
            await onWaitForGas(bot_key_address); // return control to UI
            return; // stop, do not continue
        }

        console.log("subaccount_address:", subaccount_address);
        console.log("bot_key_address:", bot_key_address);

        let subaccountAddress = subaccount_address;

        // Get Petra wallet
        const petra = await getPetraWallet();
        if (!petra) throw new Error("Could not find Petra wallet");

        // Step 1: Approve builder fee
        if (startStep <= 1) {
            onStep({
                step: 1,
                state: "loading",
                message: "Approve Builder Fee... Petra popup will appear.",
            });

            const { hash } = await stepApproveBuilderFee(
                aptos,
                petra,
                senderAddress,
                subaccountAddress,
                builderAddress,
                maxFeeBps,
            );

            await postJson("/api/onboarding/progress", {
                wallet_address: senderAddress,
                step: 2,
                tx_hash: hash,
            });

            onStep({
                step: 1,
                state: "success",
                message: "Approve Builder Fee successful.",
            });
        }

        // Step 2: Delegate trading
        if (startStep <= 2) {
            onStep({
                step: 2,
                state: "loading",
                message: "Authorize Bot Trading... Petra popup will appear.",
            });

            const { hash } = await stepDelegateTrading(
                aptos,
                petra,
                senderAddress,
                subaccountAddress,
                bot_key_address,
            );

            await postJson("/api/onboarding/progress", {
                wallet_address: senderAddress,
                step: 3,
                tx_hash: hash,
            });

            onStep({
                step: 2,
                state: "success",
                message: "Authorize Bot Trading successful.",
            });
        }

        onSuccess({ subaccountAddress, botKeyAddress: bot_key_address });
    } catch (err) {
        onError(err);
        throw err;
    }
}
// Function to continue onboarding after the user has deposited APT
export async function continueOnboarding({
    builderAddress,
    maxFeeBps = 7,
    onStep,
    onSuccess,
    onError,
} = {}) {
    const aptos = getAptosClient();
    const petra = await getPetraWallet();
    if (!petra) throw new Error("Could not find Petra wallet");

    try {
        const senderAddress = await getWalletAddress();

        // Retrieve bot_key and subaccount from the server
        const { bot_key_address, subaccount_address } = await postJson(
            "/api/onboarding/bot-key",
            { wallet_address: senderAddress },
        );

        if (!subaccount_address)
            throw new Error("Could not get subaccount address");

        // Tx1: Approve builder fee
        onStep({
            step: 1,
            state: "loading",
            message: "Approve Builder Fee... Petra popup will appear.",
        });

        const { hash: hash1 } = await stepApproveBuilderFee(
            aptos,
            petra,
            senderAddress,
            subaccount_address,
            builderAddress,
            maxFeeBps,
        );

        await postJson("/api/onboarding/progress", {
            wallet_address: senderAddress,
            step: 2,
            tx_hash: hash1,
        });

        onStep({
            step: 1,
            state: "success",
            message: "Approve Builder Fee successful.",
        });

        // Tx2: Delegate trading
        onStep({
            step: 2,
            state: "loading",
            message: "Authorize Bot Trading... Petra popup will appear.",
        });

        const { hash: hash2 } = await stepDelegateTrading(
            aptos,
            petra,
            senderAddress,
            subaccount_address,
            bot_key_address,
        );

        await postJson("/api/onboarding/progress", {
            wallet_address: senderAddress,
            step: 3,
            tx_hash: hash2,
        });

        onStep({
            step: 2,
            state: "success",
            message: "Authorize Bot Trading successful.",
        });

        onSuccess({
            subaccountAddress: subaccount_address,
            botKeyAddress: bot_key_address,
        });
    } catch (err) {
        onError(err);
        throw err;
    }
}
