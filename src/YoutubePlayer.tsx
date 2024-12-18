import React, { useEffect, useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";

interface Clip{
  speakerName: string,
  startTime: string,
  endTime: string,
  korSub: string,
  // engSub: string
}

const YoutubePlayer: React.FC = () => {
  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
      console.log("player is ready");
      event.target.playVideo();
  };
  
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

  const [opts, setOpts] = useState<YouTubeProps['opts']> ({
      height: '390', 
      width: '640',
      playerVars: {
        autoplay: 0, // 자동 재생
          controls: 1, // 컨트롤 표시
          start: 5,
        end: 7,
      },
  });
  const onClickClip = (start: string, end: string) => {
    setOpts((prevOpts: YouTubeProps['opts']) => ({
      ...prevOpts,
      playerVars: {
        ...prevOpts.playerVars,
        start: hmsToNumber(start),
        end: hmsToNumber(end),
        autoplay: 1
      }
    }))
  }
    
  return (
      <div>
        <YouTube videoId="crLbUTFh2oQ" opts={opts} onReady={onPlayerReady} />
      <input type="file" accept=".csv" onChange={fileHandler} />
      {file && <p>선택된 파일: {file.name}</p>}
      <div>
        {data.map((item, index) => (
          <div key={index}>
            {item.startTime} ~ {item.endTime} <br /> kor : {item.korSub} <br/>
            {/* <br /> eng : {item.engSub} */}
            <button onClick={() => onClickClip(item.startTime, item.endTime)}>start</button>
          </div>
        ))}
      </div>
      </div>
    );
}

export default YoutubePlayer;