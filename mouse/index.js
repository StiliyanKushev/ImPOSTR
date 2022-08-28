import ImPOSTR_Mouse_Linux from '../mouse/linux';
import ImPOSTR_Mouse_Windows from '../mouse/windows';

export default class ImPOSTR_Mouse {    
    os = null
    internal = null
    
    constructor(os) {
        this.os = os
        if(this.os == 'windows') {
            this.internal = new ImPOSTR_Mouse_Windows()
        }
        else if(this.os == 'linux') {
            this.internal = new ImPOSTR_Mouse_Linux()
        }
        else if(this.os == 'mac') {
            // todo: 
        }
    }

    async configure() {
        return await this.internal.configure()
    }

    async moveMouseOffset(xOffset, yOffset) {
        return await this.internal.moveMouseOffset(xOffset, yOffset)
    }
    
    async mouseLeftClick(x, y) {
        return await this.internal.mouseLeftClick(x, y)
    }

    async mouseRightClick(x, y) {
        return await this.internal.mouseRightClick(x, y)
    }
}