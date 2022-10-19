import { createContext } from 'react';

interface ContextInterface {
  subscribe: (evt: any, callback: any) => void;
  unsubscribe: (evt: any, callback: any) => void;
  dispatch: (evt: string, callback: any) => void;
}

const EventContext = createContext<ContextInterface>(
  {
    subscribe: () => {},
    unsubscribe: () => {},
    dispatch: () => {},
  }
)

export default EventContext;