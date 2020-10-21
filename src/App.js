import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import useSC from "./useSC";
import _ from "lodash";
import { Flipper, Flipped } from "react-flip-toolkit";

const script = "nello was very good at drawing and always loved it";

function App() {
  const onFinish = () => alert("끝!");
  const [state, action] = useSC({ script, onFinish });

  const scramble = _.shuffle(state.datas || []).filter((x) => !x.correct);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <button onClick={() => action.start()}>START SPEECH</button>
      </header>
      <Flipper flipKey={state}>
        <div
          style={{
            width: 1200,
            height: "auto",
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          {state.datas.map((x, i) => (
            <Flipped id={`flip-it-${x.word}`} key={x.word + i}>
              <span
                style={{
                  color: x.correct ? "green" : "red",
                  marginRight: 10,
                }}
              >
                {x.correct ? x.word : ""}
              </span>
            </Flipped>
          ))}
        </div>
        <div style={{ marginTop: 30, width: 1200, display: "flex" }}>
          {scramble.map((x, i) => (
            <Flipped id={`flip-it-${x.word}`} key={i + x.word}>
              <span
                style={{
                  marginRight: 20,
                  padding: 30,
                  background: "blue",
                }}
              >
                {x.word}
              </span>
            </Flipped>
          ))}
        </div>
      </Flipper>
    </div>
  );
}

export default App;
