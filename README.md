# 🎵 Discord DisTube Music Bot

<div align="center">

![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/github/license/friday2su/discord-distube-music?style=for-the-badge)

**A feature-rich Discord music bot using DisTube with slash commands, beautiful embeds, and comprehensive error handling.**

[Join Support Server](https://discord.gg/EWr3GgP6fe) • [Invite Bot](https://discord.com/api/oauth2/authorize) • [Report Bug](https://github.com/friday2su/discord-distube-music/issues)

</div>

## ✨ Features

- 🎵 Play music from YouTube, Spotify, SoundCloud, and more
- 🎮 Easy-to-use slash commands
- 🎨 Beautiful embeds with custom emojis
- 🔄 Queue management with loop and shuffle options
- 🔊 Volume control
- ⚙️ Comprehensive error handling and fallbacks

## 📋 Commands

| Command | Description |
|---------|-------------|
| `/play` | Play a song or playlist |
| `/pause` | Pause the current song |
| `/resume` | Resume playback |
| `/skip` | Skip the current song |
| `/stop` | Stop playback and clear the queue |
| `/queue` | View the current queue |
| `/nowplaying` | Show details about the current song |
| `/volume` | Adjust the volume (0-100%) |
| `/loop` | Set loop mode (Off, Song, Queue) |
| `/shuffle` | Shuffle the queue |
| `/help` | Show all available commands |

## 🚀 Setup

### Prerequisites
- [Node.js](https://nodejs.org/) 16.9.0 or higher
- [Discord Bot Token](https://discord.com/developers/applications)
- [FFmpeg](https://ffmpeg.org/download.html) (for audio processing)

### Installation

1. Clone this repository
   ```bash
   git clone https://github.com/friday2su/discord-distube-music.git
   cd discord-distube-music
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file with the following
   ```
   TOKEN=your_discord_bot_token
   CLIENT_ID=your_client_id
   ```

4. Start the bot (commands will be automatically registered)
   ```bash
   npm start
   ```

## 📷 Screenshots

<details>
<summary>Click to view screenshots</summary>

![Help Command](https://ibb.co/ym0BQfdC)
![Play](https://ibb.co/XfZYbN99)
![Queue](https://ibb.co/BVqGDd3P)

</details>

## 🛠️ Technologies

- [discord.js](https://discord.js.org/) - Discord API wrapper
- [DisTube](https://distube.js.org/) - Discord music bot module
- [dotenv](https://www.npmjs.com/package/dotenv) - Environment variable management

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

Made by Friday and Powered By Cortex Realm  
Support Server: [https://discord.gg/EWr3GgP6fe](https://discord.gg/EWr3GgP6fe)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/friday2su/discord-distube-music/issues).

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 
