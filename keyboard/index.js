import ImPOSTR_Keyboard_Linux from './linux';
import ImPOSTR_Keyboard_Windows from './windows';

export default class ImPOSTR_Keyboard {
    constructor(os) {
        this.os = os
        if(this.os == 'windows') {
            this.internal = new ImPOSTR_Keyboard_Windows()
        }
        else if(this.os == 'linux') {
            this.internal = new ImPOSTR_Keyboard_Linux()
        }
        else if(this.os == 'mac') {
            // todo: 
        }
    }

    async configure() {
        return await this.internal.configure()
    }

    async sendKeycode(keycode) {
        return await this.internal.sendKeycode(keycode)
    }

    async sendKey(key) {
        return await this.internal.sendKey(key)
    }

    async sendKeyCombo(combo) {
        return await this.internal.sendKeyCombo(combo)
    }

    async getClipboard() {
        return await this.internal.getClipboard()
    }

    async setClipboard(text) {
        return await this.internal.setClipboard(text)
    }
}