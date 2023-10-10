## Video Processing with FFMPEG

A simple Node.js script that uses the FFMPEG library to process videos: resizing them, adding text overlays, and adding background music.

### Dependencies:

- `@ffmpeg-installer/ffmpeg`
- `fluent-ffmpeg`

### Features:

1. **Resize Video:** 
   - The video is resized to a dimension of 1080x1920.
  
2. **Add Text to Video:** 
   - Each phrase provided is formatted and overlayed on the video, displayed for 5 seconds.
   - Text is white with a black background box for readability.
  
3. **Add Music to Video:** 
   - Add background music to the video. The output will be as long as the shortest input (either video or audio).

### Usage:

First, ensure you've installed the necessary dependencies:

```
npm install @ffmpeg-installer/ffmpeg fluent-ffmpeg
```

Here's a basic usage example (commented out in the code):

```javascript
(async () => {
    const phrases = ['Sky is blue', 'Oceans are green', 'Roses are violet', 'This is a long text to show on 1 line'];
    const inputVideoUrl = 'video.mp4';
    const outputVideoUrl = 'output.mp4';

    // Resize video and add text
    const video = await resizeAndPushText(phrases, inputVideoUrl, outputVideoUrl);
    console.log(video);

    // Add music to the video
    const videoWithMusic = await addMusicToVideo(outputVideoUrl, 'outputWithSound.mp4', './dreams.mp3');
    console.log(videoWithMusic);
})();
```

### Functions:

1. `resizeAndPushText(phrases, inputVideoUrl, outputVideoUrl)`
   - `phrases`: An array of text/strings you want to display on the video.
   - `inputVideoUrl`: Path to the input video.
   - `outputVideoUrl`: Path to save the processed video.

2. `addMusicToVideo(inputVideoUrl, outputVideoUrl, music)`
   - `inputVideoUrl`: Path to the input video.
   - `outputVideoUrl`: Path to save the video with music added.
   - `music`: Path to the audio file.