const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { YTSearch } = require('youtube-search-api');
const ytdl = require('ytdl-core');
const fs = require('fs');
const axios = require('axios');
// Session ID
const SESSION_ID = 'YOUR_SESSION_ID_HERE'; // Update with your session ID
const SESSION_DIR = './auth_info_' + SESSION_ID;

// Helper Functions
const getGreeting = (hour) => {
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
};

const getUptime = () => {
    const uptime = process.uptime(); // Uptime in seconds
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
};

// Function to get the bot's RAM usage
const getRamUsage = () => {
    const memoryUsage = process.memoryUsage();
    const ramUsed = (memoryUsage.rss / 1024 / 1024).toFixed(2); // Convert to MB
    return `${ramUsed} MB`;
};

// Function to get bot's speed (Placeholder function, you can add your logic here)
const getSpeed = () => {
    return 'Fast'; // Placeholder speed
};

// Alive Message Function
const sendAliveMessage = async (sock, jid, pushName) => {
    const now = new Date();
    const uptime = process.uptime();
    const uptimeString = new Date(uptime * 1000).toISOString().substr(11, 8);
    const greeting = getGreeting(now.getHours());
    const aliveText = `╔══════════════════════
    ║  ◈ *QUEEN MD WHATSAPP BOT* ◈
    ╠══════════════════════
    ║
    ║ ▢ *${greeting}* ${pushName}
    ║ ▢ *Type:* Node.js
    ║ ▢ *Version:* 2.0.0
    ║ ▢ *Owner:* Chathura Hansaka
    ║ ▢ *Prefix:* @
    ║ 
    ╠═══ *SYSTEM INFO* ═══
    ║ ▢ *RAM:* ${getRamUsage()}
    ║ ▢ *Uptime:* ${uptimeString}
    ║ ▢ *Platform:* Windows
    ║ ▢ *CPU:* 10%
    ║
    ╠═══ *TIME INFO* ═══
    ║ ▢ *Time:* ${now.toLocaleTimeString()}
    ║ ▢ *Date:* ${now.toLocaleDateString()}
    ║
    ╠═══ *BOT STATS* ═══
    ║ ▢ *Commands:* 30+
    ║ ▢ *Speed:* ${getSpeed()}
    ║ ▢ *Status:* Active
    ║
    ╚══════════════════════
    
         ▎▍▌▌▉▏▎▌▉▐▏▌▎
         QUEEN MD V2.0.0
      

`;

    const imageUrl = 'https://telegra.ph/file/c1737376abe4978d2c556.jpg'; // Replace with your Telegraph URL

    try {
        await sock.sendMessage(jid, {
            image: { url: imageUrl }, // Sends the image from the URL
            caption: aliveText,       // Adds the alive panel text as a caption
        });
    } catch (error) {
        console.error('Error sending alive panel with image:', error);
        await sock.sendMessage(jid, { text: '❌ Failed to load alive panel image!' });
    }
};


const sendPanelMenu = async (sock, jid, pushName) => {
    const now = new Date();
    const greeting = getGreeting(now.getHours());

    const menuText = `
╭━━━━━━━━━━━━━━━╮
       🌟 *BOT MENU* 🌟
╰━━━━━━━━━━━━━━━╯

👋 ${greeting}, *${pushName}*!

📋 *Available Commands:*
───────────────────────
1️⃣ *!menu* - View this menu
2️⃣ *!alive* - Check bot status
3️⃣ *!song [name]* - Download a song
4️⃣ *!video [name]* - Download a video

🕒 *Current Time:* ${now.toLocaleTimeString()}
📅 *Date:* ${now.toLocaleDateString()}

✨ *Thank you for using the bot!*
      > queen-Md 
      > Develop by Chathura Hansaka
───────────────────────
`;

    const imageUrl = 'https://telegra.ph/file/c1737376abe4978d2c556.jpg'; // Replace with your Telegraph URL

    try {
        await sock.sendMessage(jid, {
            image: { url: imageUrl }, // Sends the image from the URL
            caption: menuText,        // Adds the menu text as a caption
        });
    } catch (error) {
        console.error('Error sending menu with image:', error);
        await sock.sendMessage(jid, { text: '❌ Failed to load menu image!' });
    }
};


const downloadSong = async (sock, query, jid) => {
    try {
        const searchResults = await YTSearch(query);
        if (searchResults.items.length > 0) {
            const videoUrl = `https://www.youtube.com/watch?v=${searchResults.items[0].id}`;
            const info = await ytdl.getInfo(videoUrl);
            const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

            await sock.sendMessage(jid, { text: `⏳ Downloading: ${info.videoDetails.title}` });

            const audioStream = ytdl(videoUrl, { format: audioFormats[0] });
            const fileName = `${info.videoDetails.title}.mp3`;
            const writeStream = fs.createWriteStream(fileName);

            audioStream.pipe(writeStream);

            writeStream.on('finish', async () => {
                await sock.sendMessage(jid, {
                    audio: { url: fileName },
                    mimetype: 'audio/mp4',
                });
                fs.unlinkSync(fileName);
            });
        } else {
            await sock.sendMessage(jid, { text: '❌ No results found for the song.' });
        }
    } catch (error) {
        console.error('Error downloading song:', error);
        await sock.sendMessage(jid, { text: '❌ Error downloading the song.' });
    }
};

const downloadVideo = async (sock, query, jid) => {
    try {
        const searchResults = await YTSearch(query);
        if (searchResults.items.length > 0) {
            const videoUrl = `https://www.youtube.com/watch?v=${searchResults.items[0].id}`;
            const info = await ytdl.getInfo(videoUrl);

            await sock.sendMessage(jid, { text: `⏳ Downloading: ${info.videoDetails.title}` });

            const videoStream = ytdl(videoUrl, { quality: 'highest' });
            const fileName = `${info.videoDetails.title}.mp4`;
            const writeStream = fs.createWriteStream(fileName);

            videoStream.pipe(writeStream);

            writeStream.on('finish', async () => {
                await sock.sendMessage(jid, {
                    video: { url: fileName },
                    caption: info.videoDetails.title,
                });
                fs.unlinkSync(fileName);
            });
        } else {
            await sock.sendMessage(jid, { text: '❌ No results found for the video.' });
        }
    } catch (error) {
        console.error('Error downloading video:', error);
        await sock.sendMessage(jid, { text: '❌ Error downloading the video.' });
    }
};

const callAIChatAPI = async (query) => {
    try {
        const response = await axios.get(`https://www.dark-yasiya-api.site/ai/chatgpt?q=${encodeURIComponent(query)}`);
        if (response.data && response.data.result) {
            return response.data.result;
        } else {
            return '❌ Failed to get a valid response from the AI.';
        }
    } catch (error) {
        console.error('Error calling AI API:', error);
        return '❌ An error occurred while contacting the AI.';
    }
};

const downloadYouTubeMP3 = async (url) => {
    try {
        const response = await axios.get(`https://www.dark-yasiya-api.site/download/ytmp3?url=${encodeURIComponent(url)}`);
        if (response.data && response.data.result) {
            return response.data.result; // This will be the MP3 download URL
        } else {
            return '❌ Failed to fetch MP3 from the provided YouTube URL.';
        }
    } catch (error) {
        console.error('Error calling YouTube MP3 API:', error);
        return '❌ An error occurred while fetching the MP3.';
    }
};

// Bot Initialization
async function connectBot() {
    if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR);
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const jid = msg.key.remoteJid;
        const messageType = Object.keys(msg.message)[0];
        const text =
            messageType === 'conversation'
                ? msg.message.conversation
                : messageType === 'extendedTextMessage'
                ? msg.message.extendedTextMessage.text
                : null;

        if (!text) return;

        const pushName = msg.pushName || 'User';

        if (text.startsWith('!menu')) {
            await sendPanelMenu(sock, jid, pushName);
        } else if (text.startsWith('!alive')) {
            await sendAliveMessage(sock, jid);
        } else if (text.startsWith('!song')) {
            const query = text.slice(6).trim();
            if (query) await downloadSong(sock, query, jid);
            else await sock.sendMessage(jid, { text: '❌ Please provide a song name!' });
        } else if (text.startsWith('!video')) {
            const query = text.slice(7).trim();
            if (query) await downloadVideo(sock, query, jid);
            else await sock.sendMessage(jid, { text: '❌ Please provide a video name!' });
        }
        if (text.startsWith('!ai')) {
            const query = text.slice(4).trim(); // Extract query after "!ai "
            if (query) {
                const aiResponse = await callAIChatAPI(query); // Call the AI API
                await sock.sendMessage(jid, { text: aiResponse }); // Send the response back
            } else {
                await sock.sendMessage(jid, { text: '❌ Please provide a query for the AI!' });
            }
        }
        if (text.startsWith('!song')) {
            const url = text.slice(7).trim(); // Extract the YouTube URL after "!ytmp3 "
            if (url) {
                const mp3DownloadLink = await downloadYouTubeMP3(url); // Call the API to get the MP3
                await sock.sendMessage(jid, { text: mp3DownloadLink }); // Send the download link back
            } else {
                await sock.sendMessage(jid, { text: '❌ Please provide a YouTube video URL!' });
            }
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
            if (shouldReconnect) connectBot();
        } else if (connection === 'open') {
            console.log('Bot connected successfully!');
        }
    });
}

connectBot();
