import React, { useState, useEffect, useRef } from "react";

const useStateCallback = (initialState) => {
  const [state, setstate] = useState(initialState);
  const callbackRef = useRef(null);
  const setStateCallback = (state, callback) => {
    callbackRef.current = callback;
    setstate(state);
  };

  useEffect(() => {
    if (callbackRef.current) {
      callbackRef.current(state);
      callbackRef.current = null;
    }
  }, [state]);
  return [state, setStateCallback];
};

export default useStateCallback;