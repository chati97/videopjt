import React, { useEffect, useRef, useState } from "react";

interface Clip{
  speakerName: string,
  startTime: string,
  endTime: string,
  korSub: string,
  // engSub: string
}

const YoutubePlayer: React.FC = () => {
  const playerRef = useRef<HTMLDivElement>(null);

  const [url, setUrl] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const [player, setPlayer] = useState<YT.Player | null>(null);

  const inputValueHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);

    (window as any).onYouTubeIframeAPIReady = () => {
      if (playerRef.current) {
        const newPlayer = new window.YT.Player(playerRef.current, {
          height: '390',
          width: '640',
          videoId: url,
          playerVars: {
            autoplay: 0,
            controls: 1,
            start: 0,
            end: 0,
          }
        })
        setPlayer(newPlayer);
      }
    };

    return (() => {
      document.body.removeChild(script);
    })
  }, []);

  useEffect(() => {
    if (player && url) {
      player.loadVideoById(url);
    }
  }, [url, player]);

  
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState < Clip[]>([]);

  const fileHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      fileReader(e.target.files[0]);
    }
  }

  const hmsToNumber = (time: string) => {
    if (time) { 
      const [hours, minutes, seconds, zpo] = time.split(":").map(Number);
      return hours * 3600 + minutes * 60 + seconds + zpo * 0.01;
    } else {
      return 0;
    }
  }

  const fileReader = (file: File) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split("\n").map((row) => row.split(','));
      console.log('csv 데이터 : ', rows);
      const arr: Clip[] = [];
      for (let i = 1; i < rows.length; i++){
        const content: Clip = {
          speakerName : rows[i][0],
          startTime : rows[i][1],
          endTime : rows[i][2],
          korSub : rows[i][3],
          // engSub : rows[i].slice(4).join('')
        }
        arr.push(content);
      }
      setData(arr);
      console.log(arr);
      console.log(data);
    }
    reader.readAsText(file);
  }

  useEffect(() => {
    console.log(`data update: ${JSON.stringify(data, null, 2)}`)
  }, [data])

  const onPlayLoop = (start: string, end: string) => {
    const startTime = hmsToNumber(start);
    const endTiem = hmsToNumber(end);

    player?.seekTo(startTime, true);
    player?.playVideo();
    const interval = setInterval(() => {
      if (player && player?.getCurrentTime() >= endTiem) {
        player.pauseVideo();
        clearInterval(interval);
      }
    }, 10)
  }


    
  return (
      <div>
      {/* <YouTube videoId="crLbUTFh2oQ" opts={opts} onReady={onPlayerReady} /> */}
      <div ref={playerRef}/>
      <input type="file" accept=".csv" onChange={fileHandler} />
      <input type="text" value={inputValue} onChange={inputValueHandler} />
      <button onClick={() => {
        setUrl(inputValue) 
        console.log(url)
      }}>seturl</button>
      
      {file && <p>선택된 파일: {file.name}</p>}
        <div>
          {data.map((item, index) => (
            <div key={index}>
              {item.startTime} ~ {item.endTime} <br /> kor : {item.korSub} <br/>
              {/* <br /> eng : {item.engSub} */}
              <button onClick={() => onPlayLoop(item.startTime, item.endTime)}>start</button>
            </div>
          ))}
        </div>
      </div>
    );
}

export default YoutubePlayer;