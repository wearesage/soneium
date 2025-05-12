/**
 * Soneium mainnet chain definition
 */
export declare const soneiumMainnet: {
    blockExplorers: {
        readonly default: {
            readonly name: "Soneium Explorer";
            readonly url: string;
        };
    };
    contracts?: {
        [x: string]: import("viem").ChainContract | {
            [sourceId: number]: import("viem").ChainContract | undefined;
        } | undefined;
        ensRegistry?: import("viem").ChainContract | undefined;
        ensUniversalResolver?: import("viem").ChainContract | undefined;
        multicall3?: import("viem").ChainContract | undefined;
        universalSignatureVerifier?: import("viem").ChainContract | undefined;
    } | undefined;
    id: number;
    name: string;
    nativeCurrency: {
        readonly decimals: 18;
        readonly name: "Soneium";
        readonly symbol: "SON";
    };
    rpcUrls: {
        readonly default: {
            readonly http: readonly [string];
        };
        readonly public: {
            readonly http: readonly [string];
        };
    };
    sourceId?: number | undefined | undefined;
    testnet?: boolean | undefined | undefined;
    custom?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
};
/**
 * Soneium testnet (Minato) chain definition
 */
export declare const soneiumTestnet: {
    blockExplorers: {
        readonly default: {
            readonly name: "Soneium Explorer";
            readonly url: string;
        };
    };
    contracts?: {
        [x: string]: import("viem").ChainContract | {
            [sourceId: number]: import("viem").ChainContract | undefined;
        } | undefined;
        ensRegistry?: import("viem").ChainContract | undefined;
        ensUniversalResolver?: import("viem").ChainContract | undefined;
        multicall3?: import("viem").ChainContract | undefined;
        universalSignatureVerifier?: import("viem").ChainContract | undefined;
    } | undefined;
    id: number;
    name: string;
    nativeCurrency: {
        readonly decimals: 18;
        readonly name: "Soneium";
        readonly symbol: "SON";
    };
    rpcUrls: {
        readonly default: {
            readonly http: readonly [string];
        };
        readonly public: {
            readonly http: readonly [string];
        };
    };
    sourceId?: number | undefined | undefined;
    testnet?: boolean | undefined | undefined;
    custom?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
};
/**
 * Get the Soneium chain based on network type
 * @param networkType - The network type (mainnet or testnet)
 * @returns The Soneium chain
 */
export declare function getSoneiumChain(networkType: 'mainnet' | 'testnet'): {
    blockExplorers: {
        readonly default: {
            readonly name: "Soneium Explorer";
            readonly url: string;
        };
    };
    contracts?: {
        [x: string]: import("viem").ChainContract | {
            [sourceId: number]: import("viem").ChainContract | undefined;
        } | undefined;
        ensRegistry?: import("viem").ChainContract | undefined;
        ensUniversalResolver?: import("viem").ChainContract | undefined;
        multicall3?: import("viem").ChainContract | undefined;
        universalSignatureVerifier?: import("viem").ChainContract | undefined;
    } | undefined;
    id: number;
    name: string;
    nativeCurrency: {
        readonly decimals: 18;
        readonly name: "Soneium";
        readonly symbol: "SON";
    };
    rpcUrls: {
        readonly default: {
            readonly http: readonly [string];
        };
        readonly public: {
            readonly http: readonly [string];
        };
    };
    sourceId?: number | undefined | undefined;
    testnet?: boolean | undefined | undefined;
    custom?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
};
