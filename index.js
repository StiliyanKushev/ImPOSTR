import ImPOSTR from './impostr';

// prepare the imposter
await ImPOSTR.prepare()

setTimeout(async () => {
    await ImPOSTR.mouse.mouseRightClick(564, 472)
}, 1_000)