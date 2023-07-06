import {ClientTrustUseCase} from '../../utils/ClientTrustUseCase';
import {createContext, useContext, ReactNode} from 'react';

interface ClientTrustContextType {
  clientTrustUseCase: ClientTrustUseCase | null;
}

const ClientTrustContext = createContext<ClientTrustContextType>({
  clientTrustUseCase: null,
});

export const useClientTrust = () => useContext(ClientTrustContext);

type ClientTrustProviderProps = {
  clientTrustUseCase: ClientTrustUseCase | null;
  children: ReactNode;
};

const ClientTrustProvider = (props: ClientTrustProviderProps) => {
  return (
    <ClientTrustContext.Provider
      value={{clientTrustUseCase: props.clientTrustUseCase}}>
      {props.children}
    </ClientTrustContext.Provider>
  );
};

export default ClientTrustProvider;
