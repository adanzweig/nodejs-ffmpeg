// Importing necessary modules for video processing
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);  // Setting the path for the ffmpeg executable

// This function resizes the input video to a given dimension and adds text to it.
export async function resizeAndPushText(phrases, inputVideoUrl, outputVideoUrl) {
    // Define video filters for cropping, scaling, and trimming the video
    const objectFilters = [{
        filter: 'crop',
        options: 'iw:9/16*iw:(iw-ow)/2:(ih-oh)/2'
    }, {
        filter: 'scale',
        options: '1080:1920'
    }, {
        filter: 'trim',
        options: 'start=0:duration=' + 5 * phrases.length
    }];

    // Loop through each phrase and format it for display
    for (let i = 0; i < phrases.length; i++) {
        let newText = formatText(phrases[i]);
        // Add the formatted text as a filter to the video
        objectFilters.push({
            filter: 'drawtext',
            options: {
                text: newText,
                fontfile: 'font.ttf',
                fontcolor: 'white',
                fontsize: '100',
                box: 1,
                boxcolor: 'black@0.8',
                boxborderw: '5',
                x: '(w-text_w)/2',
                y: '(h-text_h)/2',
                enable: `between(t,${i * 5},${(i * 5) + 5})`
            }
        })
    }

    // Process the video with the defined filters
    const video = await new Promise((resolve, reject) => {
        ffmpeg().input(inputVideoUrl)
            .videoFilters(objectFilters)
            .save(outputVideoUrl)
            .on('end', resolve)
            .on('error', reject)
    });

    return video;
}

// This function formats the given text into lines that are up to 25 characters long.
function formatText(text) {
    let result = [];
    let index = 0;
    // Loop until the entire text is processed
    while (index < text.length) {
        let endIndex = index + 25;
        // Ensure the text breaks on spaces
        if (endIndex < text.length && text[endIndex] !== ' ' && text.lastIndexOf(' ', endIndex) > index) {
            endIndex = text.lastIndexOf(' ', endIndex);
        }
        result.push(text.substring(index, endIndex));
        index = endIndex + 1;
    }
    return result.join("\\\n");  // Join the broken text with newline characters
}

// This function adds music to the input video.
export async function addMusicToVideo(inputVideoUrl, outputVideoUrl, music,volume) {
    return await new Promise((resolve, reject) => {
        ffmpeg()
            .input(inputVideoUrl)
            .input(music)
            .audioFilter({filter:'volume',options:volume})
            .audioCodec('aac')  // Set the audio codec to AAC
            .toFormat('mp4')  // Set the output format to MP4
            .outputOptions('-shortest')  // Ensure the output video is only as long as the shortest input
            .save(outputVideoUrl)
            .on('end', resolve)
            .on('error', reject);
    });
}

// (The following commented-out code is an example usage of the above functions)
// (async () => {
//     const phrases = ['Sky is blue', 'Oceans are green', 'Roses are violet', 'This is a long text to show on 1 line'];
//     const inputVideoUrl = 'video.mp4';
//     const outputVideoUrl = 'output.mp4';
//     const video = await resizeAndPushText(phrases, inputVideoUrl, outputVideoUrl);
//     console.log(video);
//     const videoWithMusic = await addMusicToVideo(outputVideoUrl, 'outputWithSound.mp4', './dreams.mp3',0.01);
//     console.log(videoWithMusic);
// })();
