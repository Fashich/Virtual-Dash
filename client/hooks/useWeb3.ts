import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useGame } from '@/contexts/GameContext';

interface Web3State {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  contract: ethers.Contract | null;
  isConnecting: boolean;
  error: string | null;
}

export function useWeb3() {
  const { dispatch } = useGame();
  const [web3State, setWeb3State] = useState<Web3State>({
    provider: null,
    signer: null,
    contract: null,
    isConnecting: false,
    error: null,
  });

  const connectWallet = async () => {
    if (!window.ethereum) {
      setWeb3State(prev => ({ 
        ...prev, 
        error: 'MetaMask is not installed. Please install MetaMask to continue.' 
      }));
      return;
    }

    setWeb3State(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const balanceFormatted = ethers.formatEther(balance);

      setWeb3State(prev => ({
        ...prev,
        provider,
        signer,
        isConnecting: false,
      }));

      dispatch({
        type: 'CONNECT_WALLET',
        payload: {
          address,
          balance: balanceFormatted,
        },
      });

    } catch (error: any) {
      setWeb3State(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet',
      }));
    }
  };

  const disconnectWallet = () => {
    setWeb3State({
      provider: null,
      signer: null,
      contract: null,
      isConnecting: false,
      error: null,
    });
    
    dispatch({ type: 'DISCONNECT_WALLET' });
  };

  const purchaseCoins = async (amount: number) => {
    if (!web3State.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      // Simulate a coin purchase transaction
      const tx = await web3State.signer.sendTransaction({
        to: '0x742d35Cc6634C0532925a3b8D4D9a16A1D7Fc7e1', // Placeholder address
        value: ethers.parseEther((amount * 0.001).toString()), // 0.001 ETH per 1000 coins
      });

      await tx.wait();
      
      // Update player coins
      dispatch({
        type: 'UPDATE_PLAYER',
        payload: { coins: amount * 1000 },
      });

      return tx.hash;
    } catch (error: any) {
      throw new Error(error.message || 'Transaction failed');
    }
  };

  const purchaseDiamonds = async (amount: number) => {
    if (!web3State.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      // Simulate a diamond purchase transaction
      const tx = await web3State.signer.sendTransaction({
        to: '0x742d35Cc6634C0532925a3b8D4D9a16A1D7Fc7e1', // Placeholder address
        value: ethers.parseEther((amount * 0.01).toString()), // 0.01 ETH per 100 diamonds
      });

      await tx.wait();
      
      // Update player diamonds
      dispatch({
        type: 'UPDATE_PLAYER',
        payload: { diamonds: amount * 100 },
      });

      return tx.hash;
    } catch (error: any) {
      throw new Error(error.message || 'Transaction failed');
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return {
    ...web3State,
    connectWallet,
    disconnectWallet,
    purchaseCoins,
    purchaseDiamonds,
  };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
