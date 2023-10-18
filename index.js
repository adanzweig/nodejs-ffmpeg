// Importing necessary modules for video processing
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);  // Setting the path for the ffmpeg executable

/**
 * Trim video short
 */
async function trimVideo(inputVideoUrl, outputVideoUrl,duration) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputVideoUrl)
            .setStartTime(0)
            .setDuration(duration)
            .toFormat('mp4')
            .save(outputVideoUrl)
            .on('end', resolve)
            .on('error', reject);
    });
}

// This function resizes the input video to a given dimension and adds text to it.
async function resizeAndPushText(phrases, inputVideoUrl, outputVideoUrl) {
    // Define video filters for cropping, scaling, and trimming the video
    const objectFilters = [];

    // Loop through each phrase and format it for display
    for (let i = 0; i < 5; i++) {
        let newText = formatText(phrases[i]);
        // Add the formatted text as a filter to the video
        objectFilters.push({
            filter: 'drawtext',
            options: {
                text: newText,
                fontfile: 'font.ttf',
                fontcolor: 'white',
                fontsize: '95',
                box: 1,
                boxcolor: 'black@0.8',
                boxborderw: '5',
                x: '(w-text_w)/2',
                y: '(h-text_h)/2',
                enable: `between(t,${(i * 5)},${(i * 5) + 5})`
            }
        })
    }
    // Process the video with the defined filters
    const video = await new Promise((resolve, reject) => {
        ffmpeg().input(inputVideoUrl)
            .addOption('-loglevel', 'debug')
            .videoFilters(objectFilters)
            .save(outputVideoUrl)
            .on('end', resolve)
            .on('error', (error)=>{
                console.error(error);
                reject();
            })
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
    return result.join("\\\n").replace(/'/g,"\'");  // Join the broken text with newline characters
}

async function addMusicToVideo(inputVideoUrl, outputVideoUrl, soundArray) {
    return new Promise((resolve, reject) => {
        let ffmpegCommand = ffmpeg().input(inputVideoUrl);
        let filterComplex = [];

        soundArray.forEach((soundObject, index) => {
            ffmpegCommand = ffmpegCommand.input(soundObject.sound);
            filterComplex.push(`[${index + 1}:a]adelay=${soundObject.itsoffset * 1000}|${soundObject.itsoffset * 1000}[a${index}];[a${index}]volume=${soundObject.volume}[a${index}v]`);
        });

        let mixedAudio = soundArray.map((_, index) => `[a${index}v]`).join('');
        filterComplex.push(mixedAudio + 'amix=inputs=' + soundArray.length);

        ffmpegCommand
            .complexFilter(filterComplex)
            .audioCodec('aac')
            .toFormat('mp4')
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

module.exports = {
    resizeAndPushText,
    addMusicToVideo,
    trimVideo
}