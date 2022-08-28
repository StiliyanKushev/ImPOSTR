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

    // only used if program specified
    virtualEnvironment = {
        exists          : false,
        xServerId       : null,
        process         : null,
        program         : null,
    }

    // in linux, if we want to spoof for a program and not globally
    // we have to run it in a seperate X server
    async configureProgram(program) {
        this.virtualEnvironment.exists = true
        this.virtualEnvironment.program = program

        // save id of the current foreground window (so we can later bring it back)
        const oldForegroundWindowID = cp.execSync(`sudo xdotool getactivewindow`)

        // 1. make new x server window
        this.virtualEnvironment.xServerId = Math.floor(Math.random() * 10_000)

        console.log(`Xnest :${this.virtualEnvironment.xServerId}`)
        this.virtualEnvironment.process = cp.spawn('Xnest', [
            `:${this.virtualEnvironment.xServerId}`,
            `-name`, `${program.title || program.name} [imPOSTR]`,
            `-class`, `"imPOSTR-${this.virtualEnvironment.xServerId}"`,
            `-geometry`, `${program.width || 300}x${program.height || 300}+0+0`
        ])

        // bring old foreground window to the foreground again (might be a small flash but it's the best that can be done)
        await new Promise(resolve => {
            let intrv = setInterval(() => {
                let currentForegroundWindowID = cp.execSync(`sudo xdotool getactivewindow`)
                if(currentForegroundWindowID != oldForegroundWindowID) {
                    resolve(clearInterval(intrv))
                }
            }, 1)
        })
        cp.execSync(`sudo xdotool windowactivate ${oldForegroundWindowID}`)

        // 2. make a new bash script that acts as this program but we run the bash script with some args
        //    that let any app be ran into an x org server
        const patched = path.join(os.tmpdir(), `./${program.name}.${this.virtualEnvironment.xServerId}`)
        fs.writeFileSync(patched, `#!/bin/sh\n${program.name} ${(program.args || []).join(' ')}\n`)

        // 3. set the display variable and execute the script from step 2.
        let patchedProgram = `${this.display} sudo sh ${patched} ` + [
            `--enable-greasemonkey`, 
            `--enable-user-scripts`, 
            `--enable-extensions`, 
            `--user-data-dir=~/.config/${this.virtualEnvironment.xServerId}`, 
            `"$@"`,
        ].join(' ')

        console.log(`patched program: ${patchedProgram}`)
        cp.exec(patchedProgram)

        // run openbox (lightweight and highly compatible with high level X functions like moving the window)
        const openbox = cp.exec(`${this.display} openbox`)

        // wait for openbox to run (just in case)
        const openboxOut = await new Promise(resolve => {
            openbox.stdout.on('data', data => {
                resolve(data.toString())
            })
    
            openbox.stderr.on('data', data => {
                resolve(new Error(data.toString()))
            })
        })

        console.log(openboxOut)

        // just in-case
        if(openboxOut instanceof Error) {
            console.log(openboxOut)
            process.exit()
        }

        // just in-case
        await new Promise(resolve => { setTimeout(resolve, 500) }) 

        console.log('openbox loaded')

        // make the program window (currently active window) get to (x,y) (0,0) and resize the Xnest window to it
        const programRun = `${this.display} xdotool getactivewindow windowmove 0 0 ${program.width ? `windowsize ${program.width}` : ''} ${program.height || ''}`
        console.log(programRun)

        // just in-case
        for(let i = 0; i < 10; i++) {
            cp.execSync(programRun)
            await new Promise(resolve => { setTimeout(resolve, 10) }) 
        }

        // now we can use xdotool too control the whole program window without bringing it to the foreground!
    }

    // returns display string (if configured for a program)
    get display() {
        return this.virtualEnvironment.xServerId ? `DISPLAY=:${this.virtualEnvironment.xServerId} && ` : ''
    }

    async configure(program) {
        // configuration per program is a little different
        if(program) return await this.configureProgram(program)

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
    
        // gets the id of the virtual device based on it's name
        const getIDFromName = (name, type) => {
            let out = cp.execSync(`xinput`).toString()
            let rx = new RegExp(`${name}.+id=(\\d*)\\s+\\[${type}`, 'm')
            try { return Number(out.match(rx)[1]) }
            catch (e) { console.log(out, rx, e); process.exit() }
        }

        // wait for the virtual device process to run
        this.virtualDevice.cursorAddress = (await new Promise(resolve => {
            this.virtualDevice.process.stdout.on('data', data => {
                resolve(data.toString())
            })
    
            this.virtualDevice.process.stderr.on('data', data => {
                resolve(new Error(data.toString()))
            })
        })).split(':')[1].trim()

        console.log('virtual device at:')
        console.log(this.virtualDevice.cursorAddress)

        // it could be an error, we exist in that case
        if(this.virtualDevice.cursorAddress instanceof Error) {
            process.exit()
        }

        // wait for the virtual device to be recognised by x
        await new Promise(resolve => {
            let itvl = setInterval(() => {
                console.log('waiting for virtual device...')
                let out = cp.execSync(`xinput`).toString()
                if(out.includes(this.virtualDevice.name)) resolve(clearInterval(itvl))
            }, 500)
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
        process.on('uncaughtException', exitHandler.bind(null, {exit:false}))

        // print new mouse address
        console.log(this.virtualDevice.cursorAddress)
    }

    async writeToDevice(type, code, value, syn = false){
        let cmd = `sudo evemu-event ${this.virtualDevice.cursorAddress} --type ${type} --code ${code} --value ${value}`
        if(syn) cmd += ' --sync'
        cp.execSync(cmd)
    }

    async moveMouseOffset(x, y) {
        if(this.virtualEnvironment.exists) {
            cp.execSync(`${this.display} sudo xdotool mousemove ${x} ${y}`)
            return
        }

        // we move it to the very top left, so that relative cordinates become absolute
        this.writeToDevice('EV_REL', 'REL_X', -99999)
        this.writeToDevice('EV_REL', 'REL_Y', -99999, true)

        this.writeToDevice('EV_REL', 'REL_X', Math.round(x / 2))
        this.writeToDevice('EV_REL', 'REL_Y', Math.round(y / 2), true)
    }
    
    // to hide the virtual cursor we literally move it bottom right of the screen
    async hideCursor() {
        this.writeToDevice('EV_REL', 'REL_X', 9999)
        this.writeToDevice('EV_REL', 'REL_Y', 9999, true)
    }

    async mouseLeftClick(x, y) {
        if(this.virtualEnvironment.exists) {
            cp.execSync(`${this.display} sudo xdotool mousemove ${x} ${y} click 1`)
            return
        }

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
        if(this.virtualEnvironment.exists) {
            cp.execSync(`${this.display} sudo xdotool mousemove ${x} ${y} click 3`)
            return
        }

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