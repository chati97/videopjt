import React from 'react';
import axios from 'axios';
import YoutubePlayer from './YoutubePlayer';

const API_KEY = process.env.API_KEY
const baseURL = "https://www.google.com/youtube/v3"

function App() {
  return (
    <div>
      <h1>My YouTube Player</h1>
      <YoutubePlayer/>
    </div>
  );
}

export default App;
