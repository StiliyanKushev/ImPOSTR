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
await app.mouse.mouseRightClick(50, 50)