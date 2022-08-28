import ImPOSTR from './impostr';

// GLOBALLY

// await ImPOSTR.prepare()

// setTimeout(async () => {
//     await ImPOSTR.mouse.mouseRightClick(564, 472)
// }, 1_000)


// PER APP

const app = ImPOSTR.for({
    // name: 'virtualbox',
    name: 'google-chrome-stable',
    title: 'Testing Sandboxed Google Chrome',
    width: 900,
    height: 600,
    args: [
        '--no-sandbox',
    ]
})
await app.prepare()

// to get relative mouse positions easy use -> DISPLAY=:{get from process.stdout} && watch -n 0.1 xdotool getmouselocation
await app.mouse.mouseLeftClick(380, 512)