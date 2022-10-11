import { useContext } from "react";
import EventContext from "./EventContext";

const useEventDispatch = () => {
  const { dispatch } = useContext(EventContext);

  return dispatch;
}

export default useEventDispatch;