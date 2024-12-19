import React, { useEffect, useRef, useState } from "react";

interface Clip{
  speakerName: string,
  startTime: string,
  endTime: string,
  korSub: string,
}

const YoutubePlayer: React.FC = () => {
  const playerRef = useRef<HTMLDivElement>(null);

  const [videoId, setVideoId] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const [player, setPlayer] = useState<YT.Player | null>(null);

  const inputValueHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }

  //Youtube Player 코드

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
          videoId: videoId,
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
    if (player && videoId) {
      player.loadVideoById(videoId);
      player.pauseVideo();
    }
  }, [videoId]);

  // 재생위치 설정 코드
  
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

  // 재생시간 설정코드(hh:mm:ss:ss string -> number)

  const hmsToNumber = (time: string) => {
    if (time) { 
      const [hours, minutes, seconds, zpo] = time.split(":").map(Number);
      return hours * 3600 + minutes * 60 + seconds + zpo * 0.01;
    } else {
      return 0;
    }
  }

  
  // csv파일 업로드 및 분석 코드
  
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState < Clip[]>([]);

  const fileHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      fileReader(e.target.files[0]);
    }
  }


  const fileReader = (file: File) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split("\n").map((row) => row.split(','));
      const arr: Clip[] = [];
      for (let i = 1; i < rows.length; i++){
        const content: Clip = {
          speakerName : rows[i][0],
          startTime : rows[i][1],
          endTime : rows[i][2],
          korSub : rows[i][3],
        }
        arr.push(content);
      }
      setData(arr);
    }
    reader.readAsText(file);
  }

  // useEffect(() => {
  //   console.log(`data update: ${JSON.stringify(data, null, 2)}`)
  // }, [data])

  

  
  return (
      <div>
        {/* sample video id : crLbUTFh2oQ */}
      <div ref={playerRef}/>
      <input type="text" value={inputValue} onChange={inputValueHandler} />
      <button onClick={() => {
        setVideoId(inputValue) 
      }}>setVideoId</button>
      <button onClick={() => {
        player?.setPlaybackRate(0.5)
      }}>0.5</button>
      <button onClick={() => {
        player?.seekTo(player.getCurrentTime() + 0.01, true)
      }}>+0.01</button>
      <input type="file" accept=".csv" onChange={fileHandler} />
      {file && <p>선택된 파일: {file.name}</p>}
        <div>
          {data.map((item, index) => (
            <div key={index}>
              {item.startTime} ~ {item.endTime} <br /> kor : {item.korSub} <br/>
              <button onClick={() => onPlayLoop(item.startTime, item.endTime)}>start</button>
            </div>
          ))}
        </div>
      </div>
    );
}

export default YoutubePlayer;