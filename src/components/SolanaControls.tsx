
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NETWORKS } from '@/lib/constants';
import { useBotStore } from '@/lib/stores/botStore';
import { getBalance, startBot, stopBot, snipeToken } from '@/services/solanaBotService';

export const SolanaControls = () => {
  const { privateKey, setPrivateKey, isRunning, setIsRunning, logs, network, setNetwork, publicKey } = useBotStore();
  const [manualTokenAddress, setManualTokenAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [snipeAmount, setSnipeAmount] = useState(0.01);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);

  // Получение баланса кошелька
  const fetchBalance = useCallback(async () => {
    if (!privateKey) return;
    
    try {
      setIsCheckingBalance(true);
      const bal = await getBalance(privateKey, network);
      setBalance(bal);
    } catch (error) {
      console.error('Ошибка при получении баланса:', error);
    } finally {
      setIsCheckingBalance(false);
    }
  }, [privateKey, network]);

  // Управление запуском/остановкой бота
  const toggleBot = async () => {
    if (isRunning) {
      stopBot();
      setIsRunning(false);
    } else {
      if (!privateKey) return;
      startBot(privateKey, network, snipeAmount);
      setIsRunning(true);
    }
  };

  // Получаем баланс при изменении приватного ключа или сети
  useEffect(() => {
    // Получаем баланс при загрузке
    fetchBalance();
    
    // Обновляем баланс периодически, чаще при работающем боте
    const interval = setInterval(fetchBalance, isRunning ? 5000 : 10000);

    return () => clearInterval(interval);
  }, [privateKey, network, isRunning, fetchBalance]);

  // Ручной снайп токена
  const handleManualSnipe = async () => {
    if (!privateKey || !manualTokenAddress) return;
    
    try {
      await snipeToken(manualTokenAddress, 'UNKNOWN', privateKey, network, snipeAmount);
      setManualTokenAddress('');
    } catch (error) {
      console.error('Ошибка при снайпе токена:', error);
    }
  };

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold mb-4">Solana Bot</h2>
        
        <div className="mb-4">
          <Label htmlFor="privateKey">Приватный ключ</Label>
          <Input
            id="privateKey"
            value={privateKey || ''}
            onChange={(e) => setPrivateKey(e.target.value)}
            type="password"
            placeholder="Введите приватный ключ"
            className="mb-2"
          />
        </div>
        
        <div className="mb-4">
          <Label htmlFor="network">Сеть</Label>
          <select
            id="network"
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className="w-full p-2 rounded border bg-background"
          >
            {NETWORKS.map((net) => (
              <option key={net.value} value={net.value}>
                {net.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="bot-status"
              checked={isRunning}
              onCheckedChange={toggleBot}
              disabled={!privateKey}
            />
            <Label htmlFor="bot-status">
              {isRunning ? 'Бот запущен' : 'Бот остановлен'}
            </Label>
          </div>
        </div>
        
        <div className="mb-4">
          <Label htmlFor="snipe-amount">Сумма для снайпа (SOL)</Label>
          <Input
            id="snipe-amount"
            type="number"
            step="0.001"
            min="0.001"
            value={snipeAmount}
            onChange={(e) => setSnipeAmount(parseFloat(e.target.value))}
            className="mb-2"
          />
        </div>
        
        <div className="mb-4 p-2 bg-muted rounded">
          <div className="text-sm mt-1">Сеть: {network}</div>
          <div className="text-sm mt-1">Аккаунт: {publicKey ? publicKey.substring(0, 6) + "..." + publicKey.substring(publicKey.length - 4) : "Нет"}</div>
          {!privateKey && <div className="text-sm text-red-500 mt-1">Приватный ключ не установлен</div>}
          {privateKey && balance === 0 && <div className="text-sm text-yellow-500 mt-1">⚠️ Проверка баланса...</div>}
          {isRunning && 
            <div className="text-sm text-green-500 mt-1 flex items-center">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Активен
            </div>
          }
        </div>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="w-full mb-2">
            <TabsTrigger value="settings" className="flex-1">Настройки</TabsTrigger>
            <TabsTrigger value="logs" className="flex-1">Логи</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings">
            <div className="space-y-4">
              <div>
                <Label htmlFor="manual-token">Ручной снайп токена</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="manual-token"
                    value={manualTokenAddress}
                    onChange={(e) => setManualTokenAddress(e.target.value)}
                    placeholder="Адрес токена"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleManualSnipe} 
                    disabled={!privateKey || !manualTokenAddress}
                    variant="default"
                  >
                    Снайп
                  </Button>
                </div>
              </div>
              
              <Alert variant="default" className="bg-muted">
                <AlertDescription>
                  Баланс: {isCheckingBalance ? "Загрузка..." : `${balance.toFixed(4)} SOL`}
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
          
          <TabsContent value="logs">
            <Textarea
              readOnly
              value={logs.join('\n')}
              className="h-[200px] font-mono text-xs"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
