// Sample data matching §6 of brief. Props-driven consumers accept this shape.

const SAMPLE_DATA = {
  campaign: {
    name: "Tor × Funding the Commons",
    subtitle: "Quadratic Funding Round",
    start: "2026-05-19",
    end: "2026-06-19",
    slug: "tor-qf-2026",
  },
  totals: {
    total_donated_usd: 42310.55,
    total_matching_pool_usd: 87500.00,
    unique_donors: 1247,
    donation_count: 1389,
  },
  matching_pool: {
    total_usd: 87500.00,
    by_chain: { btc: 30000, eth: 40000, sol: 5000, zec: 7500, xmr: 5000 },
    addresses: {
      btc:  "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      eth:  "0x742d35Cc6634C0532925a3b844Bc9e7595f0b1F8",
      usdc: "0x742d35Cc6634C0532925a3b844Bc9e7595f0b1F8",
      sol:  "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5vpesT",
      zec_t:"t1RxY3vJq4kXSLGcqsqXAiqPGCbA8MsbCp2",
      xmr:  "44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A",
    },
  },
  projects: [
    {
      id: "anti-censorship",
      name: "Anti-Censorship Team",
      short_desc: "Bridges, pluggable transports, and circumvention tools",
      long_desc: "The Anti-Censorship Team maintains the bridges, pluggable transports, and obfuscation tools that keep Tor reachable in places where it is actively blocked — from state-level filtering to aggressive ISP throttling. Funding this team directly supports users in Iran, Russia, Belarus, Myanmar, and dozens of other countries where the open web is not a given.",
      team: ["Cecylia", "meskio", "shelikhoo", "itchyonion"],
      links: [
        { label: "gitlab.torproject.org/tpo/anti-censorship", url: "#" },
        { label: "Weekly updates on the Tor forum", url: "#" },
      ],
      matching_eligible_chains: ["btc", "eth", "usdc", "sol", "zec_t", "xmr"],
      addresses: {
        btc:  "bc1qac9nhgxxj6czchhnl6rxhjft7hc3g7v5pvqdyw",
        eth:  "0xAC7a1c25aaE93c3F0f8d5d64D0bD7b0aB1234567",
        usdc: "0xAC7a1c25aaE93c3F0f8d5d64D0bD7b0aB1234567",
        sol:  "AntiCensSo1anaAddr3ssGo3sHere1kXp7Vv99ZZ",
        zec_t:"t1AntiCensZcash5hieldedSaplingAddr9aa",
        xmr:  "44AntiCensorshipTeamMoneroAddress7xN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt",
      },
      total_donated_usd: 12450.22,
      unique_donors: 412,
      projected_match_usd: 28300.10,
    },
    {
      id: "tor-browser",
      name: "Tor Browser",
      short_desc: "The anonymous browser used by millions",
      long_desc: "Tor Browser is the flagship privacy browser, used by journalists, activists, and everyday people to read and publish online without surveillance. It ships on Windows, macOS, Linux, and Android, and is translated into over 40 languages by a global community of volunteers.",
      team: ["richard", "PieroV", "morgan", "boklm"],
      links: [
        { label: "torproject.org/download", url: "#" },
        { label: "Release notes", url: "#" },
      ],
      matching_eligible_chains: ["btc", "eth", "usdc", "sol", "zec_t"],
      addresses: {
        btc:  "bc1qtb8x62pfpfk4xwemx2tcq30vv9p8ktghy2qr7z",
        eth:  "0xBr0ws3rPr0j3ct7aEth4ddr3ssH3rE456781BcD",
        usdc: "0xBr0ws3rPr0j3ct7aEth4ddr3ssH3rE456781BcD",
        sol:  "BrowserSo1anaAddressGoesHere9XNnLQvKpZ",
        zec_t:"t1TorBrows3rZcashShi3ld3dS4plingAddrX9",
      },
      total_donated_usd: 18200.00,
      unique_donors: 689,
      projected_match_usd: 35100.00,
    },
    {
      id: "arti",
      name: "Arti — Tor in Rust",
      short_desc: "Next-generation Tor implementation",
      long_desc: "Arti is the ground-up reimplementation of the Tor protocol in Rust: memory-safe, modular, and designed to be embedded in other software. It is the long-term successor to the C Tor client and is already usable today for many applications.",
      team: ["nickm", "gabriela", "eta"],
      links: [
        { label: "gitlab.torproject.org/tpo/core/arti", url: "#" },
        { label: "Arti 1.3 announcement", url: "#" },
      ],
      matching_eligible_chains: ["btc", "eth", "xmr"],
      addresses: {
        btc:  "bc1qartiprojectbtcaddressgoeshere3p83kkfjhx",
        eth:  "0xArT1Pr0j3ctRustEthAddr3ssHer3a1234cd5678",
        xmr:  "44ArtiTorInRustMoneroAddr3ssN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7fxxZy",
      },
      total_donated_usd: 6890.10,
      unique_donors: 198,
      projected_match_usd: 14200.00,
    },
  ],
  sponsors: [
    { name: "Human Rights Foundation", committed_usd: 25000 },
    { name: "Web3 Privacy Now", committed_usd: 10000 },
    { name: "Open Tech Fund", committed_usd: 20000 },
    { name: "Zcash Community Grants", committed_usd: 7500 },
    { name: "Starknet Foundation", committed_usd: 15000 },
    { name: "Anonymous (via FTC)", committed_usd: 10000 },
  ],
  recent_donations: [
    { project_id: "anti-censorship", chain: "xmr",   amount_usd: 25,  verification: "view_key", minutes_ago: 2,  short: "25" },
    { project_id: "tor-browser",     chain: "btc",   amount_usd: 50,  verification: "public",   minutes_ago: 4,  short: "50" },
    { project_id: "arti",            chain: "eth",   amount_usd: 120, verification: "public",   minutes_ago: 7,  short: "120" },
    { project_id: "tor-browser",     chain: "usdc",  amount_usd: 10,  verification: "public",   minutes_ago: 9,  short: "10" },
    { project_id: "anti-censorship", chain: "zec_t", amount_usd: 75,  verification: "public",   minutes_ago: 11, short: "75" },
    { project_id: "tor-browser",     chain: "sol",   amount_usd: 8,   verification: "public",   minutes_ago: 13, short: "8" },
    { project_id: "arti",            chain: "xmr",   amount_usd: 200, verification: "view_key", minutes_ago: 18, short: "200" },
  ],
  recent_pool_donations: [
    { chain: "eth",  amount_usd: 1500, verification: "public",   minutes_ago: 3 },
    { chain: "btc",  amount_usd: 500,  verification: "public",   minutes_ago: 8 },
    { chain: "xmr",  amount_usd: 240,  verification: "view_key", minutes_ago: 15 },
    { chain: "usdc", amount_usd: 1000, verification: "public",   minutes_ago: 22 },
  ],
};

// Chain metadata — display names, wallet deep-link schemes, address family
const CHAIN_META = {
  btc:   { label: "Bitcoin",     symbol: "BTC",   uriScheme: "bitcoin:",                deepLinks: ["BlueWallet", "Muun"],        family: "btc" },
  eth:   { label: "Ethereum",    symbol: "ETH",   uriScheme: "ethereum:",               deepLinks: ["MetaMask", "Rainbow"],       family: "evm" },
  usdc:  { label: "USDC",        symbol: "USDC",  uriScheme: "ethereum:",               deepLinks: ["MetaMask", "Rainbow"],       family: "evm", note: "Ethereum mainnet" },
  sol:   { label: "Solana",      symbol: "SOL",   uriScheme: "solana:",                 deepLinks: ["Phantom", "Solflare"],       family: "sol" },
  zec_t: { label: "Zcash",       symbol: "ZEC",   uriScheme: "zcash:",                  deepLinks: ["Zashi", "Ywallet"],          family: "zec", note: "Transparent address" },
  xmr:   { label: "Monero",      symbol: "XMR",   uriScheme: "monero:",                 deepLinks: ["Cake Wallet", "Monero.com"], family: "xmr", note: "Subaddress, verified by view key" },
};

const CHAIN_ORDER = ["btc", "eth", "usdc", "sol", "zec_t", "xmr"];

Object.assign(window, { SAMPLE_DATA, CHAIN_META, CHAIN_ORDER });
