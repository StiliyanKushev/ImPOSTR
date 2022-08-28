import os from 'os';

import ImPOSTR_Keyboard from './keyboard';
import ImPOSTR_Mouse from './mouse';

let currentOS = (function () {
    switch(os.type()) {
        case 'Linux': return 'linux'
        case 'Darwin': return 'mac'
        case 'Windows_NT': return 'windows'
    }
    throw new Error('Cannot get current os type.')
})()

export default class ImPOSTR {
    static mouse = new ImPOSTR_Mouse(currentOS)
    static keyboard = new ImPOSTR_Keyboard(currentOS)

    static prepare() {
        return new Promise(async resolve => {
            await this.mouse.configure()
            await this.keyboard.configure()
            resolve()
        })
    }

    static for(program) {
        return {
            mouse: new ImPOSTR_Mouse(currentOS),
            keyboard: new ImPOSTR_Keyboard(currentOS),
            prepare: async function () {
                await this.mouse.configure(program)
                await this.keyboard.configure(program)
            }
        }
    }
}