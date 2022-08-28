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

    static getWindowByTitle(title) {
        // todo: return "new ImPOSTR_Window" object based on title
    }

    static getWindowByProcessName(name) {
        // todo: return "new ImPOSTR_Window" object based on name
    }

    static forWindow(impostrWindow) {
        return {
            mouse: new ImPOSTR_Mouse(currentOS, impostrWindow),
            keyboard: new ImPOSTR_Keyboard(currentOS, impostrWindow),
        }
    }
}