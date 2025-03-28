import { Keypair, Connection, PublicKey, LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import { useBotStore } from '@/lib/stores/botStore';
import bs58 from 'bs58';

// Глобальные переменные
let botInterval: NodeJS.Timeout | null = null;
let isActive = false;

// Получение соединения с сетью Solana
export const getConnection = (network: string) => {
  return new Connection(network);
};

// Получение ключевой пары из приватного ключа
export const getKeypairFromPrivateKey = (privateKey: string) => {
  try {
    const decodedKey = bs58.decode(privateKey);
    return Keypair.fromSecretKey(decodedKey);
  } catch (error) {
    console.error('Ошибка при декодировании приватного ключа:', error);
    throw new Error('Неверный формат приватного ключа');
  }
};

// Получение баланса кошелька
export const getBalance = async (privateKey: string, network: string): Promise<number> => {
  try {
    const connection = getConnection(network);
    const keypair = getKeypairFromPrivateKey(privateKey);

    // Обновляем публичный ключ в хранилище
    useBotStore.getState().setPublicKey(keypair.publicKey.toString());

    const balance = await connection.getBalance(keypair.publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Ошибка при получении баланса:', error);
    throw error;
  }
};

// Запуск бота
export const startBot = (privateKey: string, network: string, snipeAmount: number) => {
  if (isActive) return;

  try {
    // Проверка валидности приватного ключа
    getKeypairFromPrivateKey(privateKey);

    isActive = true;
    addLog('Бот запущен');
    addLog(`Сеть: ${network}`);
    addLog(`Сумма для снайпа: ${snipeAmount} SOL`);

    // Запуск симуляции обнаружения новых токенов
    simulateNewToken();

  } catch (error) {
    addLog(`Ошибка запуска бота: ${error.message}`);
    console.error('Ошибка запуска бота:', error);
  }
};

// Остановка бота
export const stopBot = () => {
  isActive = false;
  addLog('Бот остановлен');

  if (botInterval) {
    clearTimeout(botInterval);
    botInterval = null;
  }
};

// Функция для снайпа токена
export const snipeToken = async (
  tokenMint: string,
  tokenSymbol: string,
  privateKey: string,
  network: string,
  amount: number
) => {
  try {
    addLog(`Снайп токена: ${tokenSymbol || 'Неизвестный'} (${tokenMint.substring(0, 8)}...)`);

    // Имитация успешной транзакции
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Логируем успешную транзакцию
    const txId = bs58.encode(Keypair.generate().publicKey.toBytes());
    addLog(`✅ Успешная транзакция: ${txId.substring(0, 8)}...`);

    return { success: true, txId };
  } catch (error) {
    addLog(`❌ Ошибка снайпа: ${error.message}`);
    console.error('Ошибка снайпа токена:', error);
    throw error;
  }
};

// Добавление записи в лог
const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}`;

  const currentLogs = useBotStore.getState().logs;
  useBotStore.getState().setLogs([...currentLogs, logEntry]);

  console.log(logEntry);
};

// Симуляция обнаружения новых токенов
const simulateNewToken = () => {
  if (!isActive) return;

  const randomAddress = Keypair.generate().publicKey.toString();
  const symbols = ['PEPE', 'DOGE', 'CAT', 'MOON', 'SUN', 'STAR', 'ROCKET'];
  const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];

  addLog(`🔍 Обнаружен новый токен: ${randomSymbol} (${randomAddress.substring(0, 8)}...)`);

  // Снайпим автоматически если бот включен
  const { privateKey, network, isRunning } = useBotStore.getState();
  const snipeAmount = 0.01; // Используем фиксированную сумму для демонстрации

  if (isRunning && privateKey) {
    snipeToken(randomAddress, randomSymbol, privateKey, network, snipeAmount)
      .catch(error => console.error('Ошибка автоснайпа:', error));
  }

  // Повторяем через случайный интервал
  const nextInterval = 5000 + Math.random() * 10000;
  botInterval = setTimeout(simulateNewToken, nextInterval);
};