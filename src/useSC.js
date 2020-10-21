import React, { useEffect, useRef, useState } from "react";
import update from "immutability-helper";
import useStateCallback from "./useStateCallback";
import _ from "lodash";
import stringSimilarity from "string-similarity";
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList =
  window.SpeechGrammarList || window.webkitSpeechGrammarList;
const hasGetUserMedia = !!(
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia
);

const useSC = ({ script, onFinish, readyUpdate }) => {
  const [state, setstate] = useStateCallback({
    datas: [],
  });
  const [stack, setstack] = useState(new Set());
  const handleEnd = () => {
    console.log("FINISH");
  };

  const [scActions] = useSCInner({
    onResult: function (data) {
      handleResult(data);
    },
    script,
  });
  useEffect(() => {
    if (!script) {
      return;
    }
    const formatted = script.split(" ").map((x) => {
      return { word: x, correct: false };
    });
    setstate({ ...state, datas: formatted });
  }, [script]);

  useEffect(() => {
    if (Array.from(stack).length === 0) {
      return;
    }
    const copy = _.clone(state.datas);

    Array.from(stack).forEach((x) => {
      if (!copy[x].correct) {
        copy[x].correct = true;
      }
    });
    setstate(update(state, { datas: { $set: copy } }), (state) =>
      console.log(state.datas)
    );
  }, [stack]);

  const expectingIdx = useRef(null);

  useEffect(() => {
    if (stack.length === 0) {
      return;
    }
    console.log("THIS IS STACK", stack);
  }, [stack]);

  const handleResult = (data) => {
    const splittedTrans = data.transcript.split(" ");
    expectingIdx.current = state.datas.findIndex((x) => !x.correct);
    const newSet = new Set([...stack]);
    console.log(splittedTrans[expectingIdx.current]);
    while (checkMatch(splittedTrans, expectingIdx.current) === true) {
      newSet.add(expectingIdx.current);
      if (expectingIdx.current === state.datas.length - 1) {
        handleEnd();
        break;
      }
      expectingIdx.current++;
      setstack(newSet);
    }
    console.log(stack);
  };

  const checkMatch = (splitted, idx) => {
    const transWord = splitted[idx];
    const dataWord = state.datas[idx].word;
    if (!transWord || !dataWord) {
      return false;
    }
    console.log(transWord, dataWord);
    const score = stringSimilarity.compareTwoStrings(transWord, dataWord);
    console.log("score", score);
    return score > 0.5;
  };

  return [state, scActions];
};

const useSCInner = ({ onResult, script }) => {
  const [listening, setlistening] = useState(false);
  const [avail, setavail] = useState(false);

  const engineRef = useRef(null);
  const grammarRef = useRef(null);
  useEffect(() => {
    if (hasGetUserMedia) {
      setavail(true);
    }
    const gramList = script.split(" ").join(" | ") + " ;";
    const grammar = "#JSGF V1.0; grammar words; public <words> = " + gramList;
    engineRef.current = new SpeechRecognition();
    grammarRef.current = new SpeechGrammarList();
    grammarRef.current.addFromString(grammar, 1);
    engineRef.current.grammars = grammarRef.current;
    engineRef.current.lang = "en-US";
    engineRef.current.interimResults = true;
    SpeechRecognition.maxAlternatives = 5;
    return () => {
      engineRef.current = null;
    };
  }, [script]);

  const actions = {
    start: () => {
      if (listening || !avail) {
        //handle unavail
        return;
      }
      setlistening(true);
      engineRef.current.onstart = () => console.log("Recognition has started");
      engineRef.current.onend = () => engineRef.current.start();
      engineRef.current.onresult = handleResult;
      engineRef.current.start();
    },
    abort: () => {},
    stop: () => {},
  };

  const handleResult = async (e) => {
    if (!e.results[0][0]) {
      return;
    }
    await onResult(e.results[0][0]);
  };

  return [actions];
};

export default useSC;
