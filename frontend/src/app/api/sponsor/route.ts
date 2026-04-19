import { NextRequest, NextResponse } from 'next/server';
import * as StellarSdk from '@stellar/stellar-sdk';

/**
 * 🚀 Stellar Nexus Fee Sponsorship API
 * This endpoint allows gasless transactions by wrapping a user's transaction
 * in a Fee Bump transaction sponsored by the Nexus Treasury.
 */

const SPONSOR_SECRET = process.env.SPONSOR_SECRET || "SDZ...PLACEHOLDER"; // User must set this
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

export async function POST(req: NextRequest) {
    try {
        const { transactionXdr } = await req.json();

        if (!transactionXdr) {
            return NextResponse.json({ error: 'Missing transactionXdr' }, { status: 400 });
        }

        if (SPONSOR_SECRET === "SDZ...PLACEHOLDER") {
             // Fallback for demo if secret is not set - we'll just return an error or log it
             console.warn("SPONSOR_SECRET not configured. Gasless mode will not work on-chain.");
             return NextResponse.json({ error: 'Sponsorship service not configured' }, { status: 501 });
        }

        const sponsorKeypair = StellarSdk.Keypair.fromSecret(SPONSOR_SECRET);
        
        // 1. Load the original transaction
        const innerTx = StellarSdk.TransactionBuilder.fromXDR(transactionXdr, NETWORK_PASSPHRASE);
        
        // 2. Build the Fee Bump transaction
        // The sponsor pays the fee
        const feeBumpTx = StellarSdk.TransactionBuilder.buildFeeBumpTransaction(
            sponsorKeypair.publicKey(),
            StellarSdk.BASE_FEE, // Or a higher fee if needed
            innerTx as StellarSdk.Transaction,
            NETWORK_PASSPHRASE
        );

        // 3. Sign with sponsor's key
        feeBumpTx.sign(sponsorKeypair);

        // 4. Return the signed Fee Bump transaction
        return NextResponse.json({
            signedXdr: feeBumpTx.toXDR(),
            sponsor: sponsorKeypair.publicKey()
        });

    } catch (error: any) {
        console.error('Sponsorship Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
