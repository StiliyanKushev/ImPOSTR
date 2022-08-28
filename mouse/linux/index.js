import cp from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

export default class ImPOSTR_Mouse_Linux {
    virtualDevice = {
        id              : null,
        name            : null,
        process         : null, 
        cursorId        : null,
        cursorAddress   : null,
        cursorPosition  : null,
    }

    async configure() {
        this.virtualDevice.name = (Math.random() + 1).toString(36).substring(7)

        // this describes a mouse, with the permissions to move and click
        let dummy = 
            `N: ${this.virtualDevice.name}` + '\n' +
            `I: 0000 0000 0000 0000`        + '\n' +
            `P: 00 00 00 00 00 00 00 00`    + '\n' +
            `B: 00 0b 00 00 00 00 00 00 00` + '\n' +
            `B: 01 00 00 00 00 00 00 00 00` + '\n' +
            `B: 01 00 00 00 00 00 00 00 00` + '\n' +
            `B: 01 00 00 00 00 00 00 00 00` + '\n' +
            `B: 01 00 00 00 00 00 00 00 00` + '\n' +
            `B: 01 00 00 ff 00 00 00 00 00` + '\n' +
            `B: 01 00 00 00 00 00 00 00 00` + '\n' +
            `B: 01 00 00 00 00 00 00 00 00` + '\n' +
            `B: 01 00 00 00 00 00 00 00 00` + '\n' +
            `B: 01 00 00 00 00 00 00 00 00` + '\n' +
            `B: 01 00 00 00 00 00 00 00 00` + '\n' +
            `B: 01 00 00 00 00 00 00 00 00` + '\n' +
            `B: 01 00 00 00 00 00 00 00 00` + '\n' +
            `B: 02 43 19 00 00 00 00 00 00` + '\n' +
            `B: 03 00 00 00 00 00 01 00 00` + '\n' +
            `B: 04 10 00 00 00 00 00 00 00` + '\n' +
            `B: 05 00 00 00 00 00 00 00 00` + '\n' +
            `B: 11 00 00 00 00 00 00 00 00` + '\n' +
            `B: 12 00 00 00 00 00 00 00 00` + '\n' +
            `B: 14 00 00 00 00 00 00 00 00` + '\n' +
            `B: 15 00 00 00 00 00 00 00 00` + '\n' +
            `B: 15 00 00 00 00 00 00 00 00` + '\n' +
            `A: 28 0 255 0 0` + '\n'

        const dumpFilePath = path.join(os.tmpdir(), `./device.${this.virtualDevice.name}.properties`)
        fs.writeFileSync(dumpFilePath, dummy)

        // run the virtual device
        console.log(`evemu-device ${dumpFilePath}`)
        this.virtualDevice.process = cp.spawn('evemu-device', [dumpFilePath])
    
        // get the id of the virtual device based on it's name
        function getIDFromName(name, type) {
            let out = cp.execSync('xinput').toString()
            let rx = new RegExp(`${name}.+id=(\\d*)\\s+\\[${type}`, 'm')
            return Number(out.match(rx)[1])
        }

        // wait for the virtual device process to run
        this.virtualDevice.cursorAddress = (await new Promise(resolve => {
            this.virtualDevice.process.stdout.on('data', data => {
                resolve(data.toString())
            })
    
            this.virtualDevice.process.stderr.on('data', data => {
                resolve(data.toString())
            })
        })).split(':')[1].trim()

        // wait for the virtual device to be recognised by x
        await new Promise(resolve => {
            setInterval(() => {
                let out = cp.execSync('xinput').toString()
                if(out.includes(this.virtualDevice.name)) resolve()
            }, 300)
        })

        // get the slave id
        this.virtualDevice.id = getIDFromName(this.virtualDevice.name, 'slave')

        // create virtual cursor
        cp.execSync(`xinput create-master "cursor-${this.virtualDevice.name}"`)

        // get the master id of the cursor
        this.virtualDevice.cursorId = getIDFromName(`cursor-${this.virtualDevice.name}`, 'master')

        // attach the virtual mouse to the virtual cursor
        cp.execSync(`xinput reattach "${this.virtualDevice.id}" "${this.virtualDevice.cursorId}"`)

        // now that the virtual device is attached, hide the cursor
        this.hideCursor()

        // handle unexpected process exists
        const exitHandler = (options, exitCode) => {
            if (options.cleanup) {
                // kill the virtual device
                this.virtualDevice.process.kill()

                // delete the virtual cursor
                cp.execSync(`xinput remove-master "${this.virtualDevice.cursorId}"`)
            }
            if (exitCode || exitCode === 0) console.log(exitCode)
            if (options.exit) process.exit()
        }
        
        process.on('exit', exitHandler.bind(null,{cleanup:true}))
        process.on('SIGINT', exitHandler.bind(null, {exit:true}))
        process.on('SIGUSR1', exitHandler.bind(null, {exit:true}))
        process.on('SIGUSR2', exitHandler.bind(null, {exit:true}))
        process.on('uncaughtException', exitHandler.bind(null, {exit:true}))

        // print new mouse address
        console.log(this.virtualDevice.cursorAddress)
    }

    async writeToDevice(type, code, value, syn = false){
        let cmd = `sudo evemu-event ${this.virtualDevice.cursorAddress} --type ${type} --code ${code} --value ${value}`
        if(syn) cmd += ' --sync'
        cp.execSync(cmd)
    }

    async moveMouseOffset(x, y) {
        // we move it to the very top left, so that relative cordinates become absolute (XD)
        this.writeToDevice('EV_REL', 'REL_X', -99999)
        this.writeToDevice('EV_REL', 'REL_Y', -99999, true)

        this.writeToDevice('EV_REL', 'REL_X', Math.round(x / 2))
        this.writeToDevice('EV_REL', 'REL_Y', Math.round(y / 2), true)
    }
    
    // to hide the virtual cursor we literally move it bottom right of the screen (XD)
    async hideCursor() {
        this.writeToDevice('EV_REL', 'REL_X', 9999)
        this.writeToDevice('EV_REL', 'REL_Y', 9999, true)
    }

    async mouseLeftClick(x, y) {
        this.moveMouseOffset(x, y)

        // press down
        this.writeToDevice('EV_MSC', 'MSC_SCAN', 589825)
        this.writeToDevice('EV_KEY', 'BTN_LEFT', 1)
        this.writeToDevice('EV_ABS', 'ABS_MISC', 1, true)

        // release
        this.writeToDevice('EV_MSC', 'MSC_SCAN', 589825)
        this.writeToDevice('EV_KEY', 'BTN_LEFT', 0)
        this.writeToDevice('EV_ABS', 'ABS_MISC', 0, true)

        // hide it afterwards
        this.hideCursor()
    }

    async mouseRightClick(x, y) {
        this.moveMouseOffset(x, y)

        // press down
        this.writeToDevice('EV_MSC', 'MSC_SCAN', 589826)
        this.writeToDevice('EV_KEY', 'BTN_RIGHT', 1)
        this.writeToDevice('EV_ABS', 'ABS_MISC', 2, true)

        // release
        this.writeToDevice('EV_MSC', 'MSC_SCAN', 589826)
        this.writeToDevice('EV_KEY', 'BTN_RIGHT', 0)
        this.writeToDevice('EV_ABS', 'ABS_MISC', 0, true)

        // hide it afterwards
        this.hideCursor()
    }
}