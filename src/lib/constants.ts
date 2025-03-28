
// Список доступных сетей Solana
export const NETWORKS = [
  {
    label: 'Mainnet',
    value: 'https://api.mainnet-beta.solana.com',
  },
  {
    label: 'Devnet',
    value: 'https://api.devnet.solana.com',
  },
  {
    label: 'Testnet',
    value: 'https://api.testnet.solana.com',
  },
  {
    label: 'Localnet',
    value: 'http://localhost:8899',
  },
];

// Константы для приложения
export const APP_NAME = 'Solana Sniper Bot';
export const APP_VERSION = '1.0.0';

// Размер комиссии по умолчанию
export const DEFAULT_SLIPPAGE = 0.5; // 0.5%

// Таймаут для транзакций
export const TX_TIMEOUT = 30000; // 30 секунд
