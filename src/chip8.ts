import { state, nextCommand, init, loadProgram } from "./cpu"
import { keys, width, height } from "./consts"

let ctx: CanvasRenderingContext2D

const setupGraphics = () => {
    const element = document.createElement("canvas")
    element.width = width
    element.height = height
    const emulator = document.getElementById("emulator")
    const lctx = element.getContext("2d")
    if (!emulator || !lctx) throw new Error("invalid template")
    emulator.appendChild(element)
    ctx = lctx
}

const draw = () => {
    if (!state.isDrawing) return
    const pixels = ctx.getImageData(0, 0, width, height)
    const fg = [45, 199, 239]
    const bg = [23, 26, 40]
    state.screen.forEach((p, index) => {
        const i = index * 4
        const c = p ? fg : bg
        pixels.data[i] = c[0]
        pixels.data[i + 1] = c[1]
        pixels.data[i + 2] = c[2]
        pixels.data[i + 3] = 255
    })
    ctx.putImageData(pixels, 0, 0)
    state.isDrawing = false
}

const toggleKey = (pressed: boolean) => ({ key }: { key: string }) => {
    if (key === "ArrowLeft") key = "q"
    if (key === "ArrowRight") key = "e"
    if (key === "ArrowDown") key = "r"
    if (key === " ") key = "w"
    const i = keys.indexOf(key)
    if (i !== -1) state.keys[i] = pressed
}

const setupInput = () => {
    document.addEventListener("keydown", toggleKey(true))
    document.addEventListener("keyup", toggleKey(false))
}

export const readProgram = async (path: string) => {
    const resp = await fetch(path)
    const buffer = await resp.arrayBuffer()
    const program = new Uint8Array(buffer)
    loadProgram(program)
}

const main = async () => {
    init()
    setupGraphics()
    setupInput()
    await readProgram("./SpaceInvaders2.ch8")

    let currentTick = 0
    setInterval(() => {
        nextCommand()
        draw()
        if (++currentTick % 6 === 0 && state.delayTimer > 0) state.delayTimer--
    }, 0)
}

main()
