import { useState, useEffect, useRef } from "react";
import { resizeImage } from "./helpers";
import Button from "./Button";
import Control from "./Control";
import ColorControl from "./ColorControl";
import { Gradient } from "./fancy-source/gradient";
import "./App.css";

const App = () => {
  const [colors, setColors] = useState(["#eb75b6", "#ddf3ff", "#6e3deb", "#c92f3c"]);
  const [playing, setPlaying] = useState(true);
  const [darkTop, setDarkTop] = useState(false);
  const gradient = useRef(new Gradient());

  const canvasId = "fancy-canvas";

  useEffect(() => {
    gradient.current.initGradient("#" + canvasId, colors);
    gradient?.current.changePosition(780); 
  }, []);

  useEffect(() => {
    gradient.current.changeGradientColors(colors)
  }, [colors]);

  const handlePlayPause = () => {
    if (playing) {
      gradient.current.pause();
    } else {
      gradient.current.play();
    }
    setPlaying(!playing);
  }

  const regenerate = () => {
    const value = Math.floor(Math.random() * 1000)
    gradient?.current.changePosition(value);
  };

  const handleDarkTop = () => {
    gradient.current.toggleDarkenTop();
    setDarkTop(!darkTop);
  };

  return (
    <main className="c-app">
      <section className="c-app__body">
        {/* <div className="c-app__logo">
          fancy gradients
        </div> */}
        <div className="c-canvas">
          <div className="c-canvas__controls">
            <div>
              {
                colors.map((color, ci) => (
                  <ColorControl
                    small
                    value={color}
                    onChange={(e) => setColors(colors.map((c, i) => i === ci ? e.target.value : c))} />
                ))
              }
            </div>
            <div>
              <Button
                icon
                onClick={handleDarkTop}>
                {
                  darkTop
                  ? <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Z"/></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Z"/></svg>
                }
              </Button>
              <Button
                icon
                onClick={regenerate}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/></svg>
              </Button>
              <Button
                icon
                onClick={handlePlayPause}>
                {
                  playing
                  ? <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M320-200v-560l440 280-440 280Z"/></svg>
                }
              </Button>
              <Button
                type="primary"
                icon
                onClick={() => {}}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
              </Button>
            </div>
          </div>
          <div className="c-canvas__canvas">
            <canvas 
              id={canvasId} />
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;