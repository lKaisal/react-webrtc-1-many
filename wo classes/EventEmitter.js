// https://dominikdosoudil.medium.com/building-event-emitter-using-react-hooks-650f94a057ea

import { useCallback, useMemo, useReducer } from "react";
import EventContext from "./EventContext";

// type State = {[key: string]: any}

const EventEmitter = ({children}) => {
  function reducer(state, action) {
    const { type, event } = action;
    switch (type) {
      case 'subscribe': {
        const { callback } = action;
        if (event in state) {
          if (state[event].includes(callback)) {
            return state;
          }
          return { ...state, [event]: [...state[event], callback] };
        }
        return { ...state, [event]: [callback] };
      }

      case 'unsubscribe': {
        const { callback } = action;
        if (event in state && state[event].includes(callback)) {
          return { ...state, [event]: [...state[event].filter(cb => cb !== callback)] };
        }
        return state;
      }
    }
  }
  // function reducer(state: State, action: {type: string, event: string, callback: void}) {
  //   const { type, event } = action;
  //   switch (type) {
  //     case 'subscribe': {
  //       const { callback } = action;
  //       if (event in state) {
  //         if (state[event].includes(callback)) {
  //           return state;
  //         }
  //         return { ...state, [event]: [...state[event], callback] };
  //       }
  //       return { ...state, [event]: [callback] };
  //     }

  //     case 'unsubscribe': {
  //       const { callback } = action;
  //       if (event in state && state[event].includes(callback)) {
  //         return { ...state, [event]: [...state[event].filter((cb: void) => cb !== callback)] };
  //       }
  //       return state;
  //     }
  //   }
  // }

  const [subscribers, dispatch] = useReducer(reducer(state, action), {}, () => ({}))

  const subscribersRef = React.useRef({});
  subscribersRef.current = React.useMemo(() => subscribers, [subscribers]);

  const subscribe = useCallback(
    (evt, callback) => {
      dispatch({ type: 'subscribe', evt, callback });
    }, 
    [dispatch]
  );

  const unsubscribe = useCallback(
    (evt, callback) => {
      dispatch({ type: 'unsubscribe', evt, callback });
    }, 
    [dispatch]
  );

  const dispatchEvent = React.useCallback(
    (evt, payload) => {
      if (evt in subscribersRef.current) {
        subscribersRef?.current[evt].forEach((cb) => cb(payload));
      }
    },
    [subscribersRef],
  )

  const eventPack = useMemo(() => {
    const subscribe = () => [];
    const unsubscribe = () => [];
    const dispatch = () => [];

    return {
      subscribe,
      unsubscribe,
      dispatch
    };
  }, []);

  return (
    <EventContext.Provider value={eventPack}>
      {children}
    </EventContext.Provider>
  )
}

export default EventEmitter;