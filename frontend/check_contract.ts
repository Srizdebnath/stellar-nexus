
import * as StellarSdk from '@stellar/stellar-sdk';

const CONTRACT_ID = "CAAQBQS5XV4KB3TKY4CLLEXGQL2Y43D5HG2JPVKKBQ7CWYK2YXT7M5LE";
const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

async function checkContract() {
    const server = new StellarSdk.rpc.Server(SOROBAN_RPC_URL);

    // Use a random public key for read-only access simulation (doesn't need to be funded or valid for reads usually, but valid format helps)
    const sourceKey = StellarSdk.Keypair.random();
    const source = new StellarSdk.Account(sourceKey.publicKey(), "0");

    console.log("Checking contract:", CONTRACT_ID);

    try {
        // Use simulateTransaction for Read-Only calls
        const tx = new StellarSdk.TransactionBuilder(
            source,
            { fee: StellarSdk.BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE }
        )
            .addOperation(StellarSdk.Operation.invokeHostFunction({
                func: StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract(
                    new StellarSdk.xdr.InvokeContractArgs({
                        contractAddress: new StellarSdk.Address(CONTRACT_ID).toScAddress(),
                        functionName: "get_listing_count",
                        args: []
                    })
                ),
                auth: []
            }))
            .setTimeout(30)
            .build();

        const sim = await server.simulateTransaction(tx);

        if (StellarSdk.rpc.Api.isSimulationSuccess(sim)) {
            console.log("Simulation Successful");
            // @ts-ignore
            const result = sim.result.retval;
            const count = StellarSdk.scValToNative(result);
            console.log("Total Listings Count:", count);
        } else {
            console.log("Simulation Failed:", sim);
        }

    } catch (e) {
        console.error("Error invoking contract:", e);
    }
}

checkContract();
