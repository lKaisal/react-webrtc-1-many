import { useEffect, useContext } from "react";
import EventContext from "./EventContext";

const useEvent = (evt: any, callback: any) => {
  const { subscribe, unsubscribe, dispatch } = useContext(EventContext);

  useEffect(() => {
    subscribe(evt, callback);

    return () => unsubscribe(evt, callback);
  }, [ subscribe, unsubscribe, dispatch ]);
}

export default useEvent;