import { useState, useEffect, useRef } from "react";
import { getNearbyHex } from "./helpers";
import Button from "./Button";
import ColorControl from "./ColorControl";
import { Gradient } from "./fancy-gradient-src/gradient";
import "./App.css";

const COLOR_PALETTES = [
  ["#eb75b6", "#ddf3ff", "#6e3deb", "#c92f3c"],
  ["#FF5F7E", "#FFBD3C", "#39E991", "#3C91FF"],
  ["#FF0054", "#FF7F11", "#00F5D4", "#9B5DE5"],
  ["#FF595E", "#FFCA3A", "#8AC926", "#1982C4"],
  ["#FF4C4C", "#FF9A00", "#FF36F4", "#38B6FF"],
  ["#FF00FF", "#00FFFF", "#FFFF00", "#FF007C"]
];

const App = () => {
  const [colors, setColors] = useState(COLOR_PALETTES[5]);
  const [playing, setPlaying] = useState(true);
  const [darkTop, setDarkTop] = useState(false);
  const [vidLength, setVidLength] = useState<15000 | 30000 | 60000>(15000);
  // const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const gradient = useRef(new Gradient());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const initGradient = (c = colors) => {
    gradient.current.initGradient(`#${canvasRef.current?.id}`, c);
    regenerateGradient();
  };

  const handleCacheInit = (cache: { colors: string[]; darkTop: boolean; playing: boolean; }) => {
    initGradient(cache.colors);
    if (cache.darkTop) {
      gradient.current.toggleDarkenTop();
    }
    if (!cache.playing) {
      gradient.current.pause();
    }
  };

  useEffect(() => {
    parent.postMessage({ pluginMessage: { type: "load-storage", key: "cache" } }, "*");
    window.onmessage = (event) => {
      const msg = event.data.pluginMessage;
      if (msg.type === "storage-loaded") {
        if (msg.key === "cache" && msg.value) {
          setColors(msg.value.colors);
          setDarkTop(msg.value.darkTop);
          setPlaying(msg.value.playing);
          handleCacheInit(msg.value);
          // handle old cache values
          if (msg.value.vidLength === 5000 || msg.value.vidLength === 10000) {
            setVidLength(15000);
          } else {
            setVidLength(msg.value.vidLength);
          }
        } else {
          initGradient();
        }
      }
    };
  }, []);

  useEffect(() => {
    parent.postMessage({
      pluginMessage: { type: "save-storage", key: "cache", value: {
        colors,
        darkTop,
        vidLength,
        playing
      }},
    }, "*");
  }, [colors, darkTop, vidLength, playing]);

  useEffect(() => {
    gradient.current.changeGradientColors(colors);
  }, [colors]);

  const handlePlayPause = () => {
    if (playing) {
      gradient.current.pause();
    } else {
      gradient.current.play();
    }
    setPlaying(!playing);
  }

  const regenerateGradient = () => {
    const value = Math.floor(Math.random() * 1000)
    gradient?.current.changePosition(value);
    if (!playing) {
      gradient.current.pause();
    }
  };

  const handleDarkTop = () => {
    gradient.current.toggleDarkenTop();
    setDarkTop(!darkTop);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    setColors(
      colors.map((c, ci) => i === ci ? e.target.value : c)
    );
  };

  const handleAddColor = () => {
    const lastColor = colors[colors.length - 1];
    const newColors = [...colors, getNearbyHex(lastColor, 100)];
    initGradient(newColors);
    setColors(newColors);
  };

  const handleRemoveColor = (i: number) => {
    const newColors = colors.filter((c, ci) => i !== ci);
    initGradient(newColors);
    setColors(newColors);
  };

  const handleVideoLength = (value: 15000 | 30000 | 60000) => {
    if (value !== vidLength) {
      setVidLength(value);
    }
  };

  const addFancyGradientVideo = async () => {
    if (!canvasRef.current) return;

    setRecording(true);

    const canvas = canvasRef.current;

    // Capture still frame
    const stillImageDataUrl = canvas.toDataURL("image/png");

    // Start recording video
    const stream = canvas.captureStream(60);
    const recordedChunks: BlobPart[] = [];
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    const stopRecording = () =>
      new Promise<Blob>((resolve) => {
        recorder.onstop = () =>
          resolve(new Blob(recordedChunks, { type: "video/webm" }));
        recorder.stop();
      });

    recorder.start();

    // Record for a fixed duration
    await new Promise((res) => setTimeout(res, vidLength));
    const videoBlob = await stopRecording();

    // console.log("Video size in MB:", videoBlob.size / (1024 * 1024));

    // Dev preview
    // const url = URL.createObjectURL(videoBlob);
    // setVideoUrl(url);

    const reader = new FileReader();
    reader.onload = () => {
      const videoDataUrl = reader.result as string;

      // Send both video and still image to the plugin
      parent.postMessage(
        {
          pluginMessage: {
            type: "add-fancy-gradient-video",
            video: videoDataUrl,
            image: stillImageDataUrl,
          },
        },
        "*"
      );
    };
    reader.readAsDataURL(videoBlob);

    setRecording(false);
  };

  const addFancyGradientImage = async () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const stillImageDataUrl = canvas.toDataURL("image/png");
    
    parent.postMessage(
      {
        pluginMessage: {
          type: "add-fancy-gradient-image",
          image: stillImageDataUrl,
        },
      },
      "*"
    );
  };

  const handleAddFancyGradient = () => {
    if (playing) {
      addFancyGradientVideo();
    } else {
      addFancyGradientImage();
    }
  };

  return (
    <main className="c-app">
      <section className="c-app__body">
        <div className="c-app__controls c-app__controls--colors">
          <div className="c-app__control-group">
            {
              colors.map((c, i) => (
                <ColorControl
                  disabled={recording}
                  icon
                  containerAs="div"
                  modifier={["stacked-icon"]}
                  value={c}
                  right={
                    colors.length > 2
                    ? <Button 
                        modifier={["small", "icon", "bare"]}
                        onClick={(() => handleRemoveColor(i))}
                        disabled={recording}>
                        <svg height="24px" viewBox="0 -960 960 960" width="24px"><path d="m257.5-239-18-18.5 222-222.5-222-222.5 18-18.5L480-498.5 702.5-721l18 18.5-222 222.5 222 222.5-18 18.5L480-461.5 257.5-239Z"/></svg>
                      </Button>
                    : null
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleColorChange(e, i)} />
              ))
            }
            <Button 
              modifier={["icon"]}
              onClick={handleAddColor}
              disabled={recording}>
              <svg height="24px" viewBox="0 -960 960 960" width="24px"><path d="M466-466H252v-28h214v-214h28v214h214v28H494v214h-28v-214Z"/></svg>
            </Button>
          </div>
        </div>
        {/* <video 
          className="c-app__video-preview"
          src={videoUrl} 
          controls 
          autoPlay 
          loop /> */}
        <div className="c-app__canvas">
          <canvas 
            ref={canvasRef}
            id="fancy-canvas"
            className="c-app__canvas-overlay" />
          {
            recording
            ? <div className="c-app__canvas-overlay c-app__canvas-overlay--recording">
                <div>
                  <div />
                </div>
              </div>
            : null
          }
        </div>
        <div className="c-app__controls">
          <div className="c-app__control-group">
            <Button
              modifier={["icon"]}
              onClick={handleDarkTop}
              disabled={recording}>
              {
                darkTop
                ? <svg height="24px" viewBox="0 -960 960 960" width="24px"><path d="M483-172q-128.33 0-218.17-89.83Q175-351.67 175-480q0-113 71.5-197.5T425-783q-14 28-22 59t-8 64q0 111.67 78.17 189.83Q551.33-392 663-392q33 0 64-8t58-22q-20 107-104.5 178.5T483-172Zm0-28q88 0 158-48.5T743-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T367-660q0-20 3-40t8-40q-78 32-126.5 102T203-480q0 116 82 198t198 82Zm-10-270Z"/></svg>
                : <svg height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 28q-62 0-105-43t-43-105q0-62 43-105t105-43q62 0 105 43t43 105q0 62-43 105t-105 43ZM200-466H66v-28h134v28Zm694 0H760v-28h134v28ZM466-760v-134h28v134h-28Zm0 694v-134h28v134h-28ZM274-668l-82-80 19-21 81 81-18 20Zm475 477-81-81 18-20 82 80-19 21Zm-81-495 80-82 21 19-81 81-20-18ZM191-211l81-81 18 18-79 83-20-20Zm289-269Z"/></svg>
              }
            </Button>
            <Button
              modifier={["icon"]}
              onClick={regenerateGradient}
              disabled={recording}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M106-222v-26q25-4 43.5-13l37-18q18.5-9 40.5-16t53-7q32 0 55.5 8.5t46 19Q404-264 427-255t53 9q30 0 53-9t45.5-19.5q22.5-10.5 46.5-19t55-8.5q32 0 53.5 7t40 16l37 18q18.5 9 43.5 13v26q-25-3-44.5-12l-39-18q-19.5-9-40.5-16.5t-50-7.5q-28 0-51 8.5t-45.5 19Q561-238 536.5-229t-56.5 9q-32 0-56.5-9t-47-19.5q-22.5-10.5-45-19T280-276q-28 0-49.5 7.5t-41 16.5l-39 18q-19.5 9-44.5 12Zm0-146v-26q25-4 43.5-13l37-18q18.5-9 40.5-16t53-7q32 0 55.5 8.5t46 19Q404-410 427-401t53 9q30 0 53-9t45.5-19.5q22.5-10.5 46.5-19t55-8.5q32 0 53.5 7t40 16l37 18q18.5 9 43.5 13v26q-25-3-44.5-12l-39-18q-19.5-9-40.5-16.5t-50-7.5q-28 0-51 8.5t-45.5 19Q561-384 536.5-375t-56.5 9q-32 0-56.5-9t-47-19.5q-22.5-10.5-45-19T280-422q-28 0-49.5 7.5t-41 16.5l-39 18q-19.5 9-44.5 12Zm0-146v-26q25-4 43.5-13l37-18q18.5-9 40.5-16t53-7q32 0 55.5 8.5t46 19Q404-556 427-547t53 9q30 0 53-9t45.5-19.5q22.5-10.5 46.5-19t55-8.5q32 0 53.5 7t40 16l37 18q18.5 9 43.5 13v26q-25-3-44.5-12l-39-18q-19.5-9-40.5-16.5t-50-7.5q-28 0-51 8.5t-45.5 19Q561-530 536.5-521t-56.5 9q-32 0-56.5-9t-47-19.5q-22.5-10.5-45-19T280-568q-28 0-49.5 7.5t-41 16.5l-39 18q-19.5 9-44.5 12Zm0-146v-26q25-4 43.5-13l37-18q18.5-9 40.5-16t53-7q32 0 55.5 8.5t46 19Q404-702 427-693t53 9q30 0 53-9t45.5-19.5q22.5-10.5 46.5-19t55-8.5q32 0 53.5 7t40 16l37 18q18.5 9 43.5 13v26q-25-3-44.5-12l-39-18q-19.5-9-40.5-16.5t-50-7.5q-28 0-51 8.5t-45.5 19Q561-676 536.5-667t-56.5 9q-32 0-56.5-9t-47-19.5q-22.5-10.5-45-19T280-714q-28 0-49.5 7.5t-41 16.5l-39 18q-19.5 9-44.5 12Z"/></svg>
            </Button>
          </div>
          <div className="c-app__control-group">
            {
              playing
              ? <div className="c-button-group">
                  <Button 
                    onClick={() => handleVideoLength(15000)}
                    modifier={["icon", vidLength === 15000 ? "radio" : ""]}
                    disabled={recording}>
                    15s
                  </Button>
                  <Button 
                    onClick={() => handleVideoLength(30000)}
                    modifier={["icon", vidLength === 30000 ? "radio" : ""]}
                    disabled={recording}>
                    30s
                  </Button>
                  <Button 
                    onClick={() => handleVideoLength(60000)}
                    modifier={["icon", vidLength === 60000 ? "radio" : ""]}
                    disabled={recording}>
                    60s
                  </Button>
                </div>
              : null
            }
            <Button
              modifier={["icon"]}
              onClick={handlePlayPause}
              disabled={recording}>
              {
                playing
                ? <svg height="24px" viewBox="0 -960 960 960" width="24px"><path d="M546-252v-456h162v456H546Zm-294 0v-456h162v456H252Zm322-28h106v-400H574v400Zm-294 0h106v-400H280v400Zm0-400v400-400Zm294 0v400-400Z"/></svg>
                : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 12L7 19V5L18 12ZM7.66016 17.7969L16.7705 12L7.66016 6.20215V17.7969Z"/></svg>
              }
            </Button>
            <Button
              modifier={["primary", "icon"]}
              onClick={handleAddFancyGradient}
              disabled={recording}>
              {
                recording
                ? <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M217-212q-26 0-43-17t-17-43v-416q0-26 17-43t43-17h416q26 0 43 17t17 43v188l110-110v260L693-460v188q0 26-17 43t-43 17H217Zm0-28h416q14 0 23-9t9-23v-416q0-14-9-23t-23-9H217q-14 0-23 9t-9 23v416q0 14 9 23t23 9Zm-32 0v-480 480Z"/></svg>
                : <svg height="24px" viewBox="0 -960 960 960" width="24px"><path d="M453-140v-313H140v-54h313v-313h54v313h313v54H507v313h-54Z"/></svg>
              }
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;