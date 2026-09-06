import { solanaRpcCall } from "@borneo/lib/solana/public-rpc";

export type WalletBalanceRow = {
  symbol: string;
  amount: string;
  mint: string | null;
};

export type WalletBalances = {
  address: string;
  balances: WalletBalanceRow[];
};

const KNOWN_MINT_SYMBOLS: Record<string, string> = {
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USDC",
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "USDT",
  So11111111111111111111111111111111111111112: "WSOL",
};

const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

function formatTokenAmount(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "0";
  if (value >= 1) return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
  return value.toLocaleString(undefined, { maximumSignificantDigits: 4 });
}

function formatSol(lamports: number): string {
  return formatTokenAmount(lamports / 1_000_000_000);
}

type TokenAccountResult = {
  pubkey: string;
  account: {
    data: {
      parsed?: {
        info?: {
          mint?: string;
          tokenAmount?: {
            uiAmount?: number | null;
            uiAmountString?: string;
          };
        };
      };
    };
  };
};

export async function fetchWalletBalances(address: string): Promise<WalletBalances> {
  const [lamports, tokenAccounts] = await Promise.all([
    solanaRpcCall<number>("getBalance", [address]),
    solanaRpcCall<{ value: TokenAccountResult[] }>("getTokenAccountsByOwner", [
      address,
      { programId: TOKEN_PROGRAM },
      { encoding: "jsonParsed" },
    ]),
  ]);

  const rows: WalletBalanceRow[] = [
    {
      symbol: "SOL",
      amount: formatSol(lamports),
      mint: null,
    },
  ];

  for (const entry of tokenAccounts.value) {
    const info = entry.account.data.parsed?.info;
    const mint = info?.mint?.trim();
    const uiAmount = info?.tokenAmount?.uiAmount;
    const uiAmountString = info?.tokenAmount?.uiAmountString;
    const amount =
      uiAmountString ??
      (typeof uiAmount === "number" ? String(uiAmount) : null);
    if (!mint || !amount || Number(amount) === 0) continue;

    rows.push({
      symbol: KNOWN_MINT_SYMBOLS[mint] ?? `${mint.slice(0, 4)}…${mint.slice(-4)}`,
      amount: formatTokenAmount(Number(amount)),
      mint,
    });
  }

  rows.sort((a, b) => {
    if (a.symbol === "SOL") return -1;
    if (b.symbol === "SOL") return 1;
    if (a.symbol === "USDC") return -1;
    if (b.symbol === "USDC") return 1;
    return a.symbol.localeCompare(b.symbol);
  });

  return { address, balances: rows };
}
