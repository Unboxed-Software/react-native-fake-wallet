import {Connection, type ConnectionConfig} from '@solana/web3.js';
import {
  useState,
  useCallback,
  useContext,
  useMemo,
  createContext,
  ReactNode,
} from 'react';

type ConnectionContextType = {
  connection: Connection;
};

const ConnectionContext = createContext<ConnectionContextType>(
  {} as ConnectionContextType,
);

export const ConnectionProvider = ({
  endpoint,
  config = {commitment: 'confirmed'},
  children,
}: {
  endpoint: string;
  config: ConnectionConfig;
  children: ReactNode;
}) => {
  const connection = useMemo(
    () => new Connection(endpoint, config),
    [endpoint, config],
  );

  return (
    <ConnectionContext.Provider value={{connection}}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => useContext(ConnectionContext);
