import { opcodes, init, state } from "./emulator"

const initWithV = (delta: NMap<number>) =>
    init({ V: new Array(16).fill(0).map((_, i) => (delta[i] !== undefined ? delta[i] : 0)) })

describe("opcodes", () => {
    beforeEach(() => init())

    describe("flow opcodes", () => {
        it("Calls a subroutine.", () => {
            opcodes.call(0x2123)
            expect(state.sp).toEqual(1)
            expect(state.pc).toEqual(0x123)
        })

        it("Calls a subrutine and returns", () => {
            opcodes.call(0x2123)
            opcodes.return()
            expect(state.pc).toEqual(0x200)
            expect(state.sp).toEqual(0)
        })

        it("Calls two subrutines and returns", () => {
            opcodes.call(0x2123)
            opcodes.call(0x2234)
            opcodes.return()
            expect(state.sp).toEqual(1)
            expect(state.pc).toEqual(0x123)
        })

        it("Goto to address", () => {
            opcodes.goto(0x1123)
            expect(state.pc).toEqual(0x123)
        })
    })

    describe("Conditional opcodes", () => {
        it("runs next instruction when VX are not equal", () => {
            opcodes.skipIfNNEq(0x30ff)
            expect(state.pc).toEqual(0x202)
        })
        it("skips next instruction when VX are equal", () => {
            opcodes.skipIfNNEq(0x3000)
            expect(state.pc).toEqual(0x204)
        })

        it("runs next instruction when VX are equal", () => {
            opcodes.skipIfNNNotEq(0x30ff)
            expect(state.pc).toEqual(0x204)
        })
        it("skips next instruction when VX are not equal", () => {
            opcodes.skipIfNNNotEq(0x3000)
            expect(state.pc).toEqual(0x202)
        })

        it("skips next instruction if V[X] === V[Y]", () => {
            opcodes.skipIfVyEq(0x5010)
            expect(state.pc).toEqual(0x204)
        })
        it("runs next instruction if V[X] === V[Y]", () => {
            initWithV({ 1: 108 })
            opcodes.skipIfVyEq(0x5010)
            expect(state.pc).toEqual(0x202)
        })
    })

    describe("Cond opcodes", () => {
        it("Sets Vx to NN.", () => {
            opcodes.setNN(0x61fa)
            expect(state.V[1]).toEqual(0xfa)
            expect(state.pc).toEqual(0x202)
            opcodes.setNN(0x610f)
            expect(state.V[1]).toEqual(0x0f)
        })

        it("Adds NN to Vx.", () => {
            expect(state.V[1]).toEqual(0)
            opcodes.addNN(0x71f0)
            expect(state.V[1]).toEqual(0xf0)

            expect(state.pc).toEqual(0x202)
            opcodes.addNN(0x710f)
            expect(state.V[1]).toEqual(0xff)
            expect(state.pc).toEqual(0x204)
        })

        it("Sets Vx to Vy.", () => {
            initWithV({ 1: 108 })
            opcodes.setVy(0x8010)
            expect(state.V[0]).toEqual(108)
            expect(state.pc).toEqual(0x202)
        })
    })

    describe("Bitwise opcodes", () => {
        describe("OR", () => {
            it("0 | 0", () => {
                opcodes.orVy(0x8011)
                expect(state.V[0]).toEqual(0)
                expect(state.pc).toEqual(0x202)
            })

            it("0 | f", () => {
                initWithV({ 1: 0xf })
                opcodes.orVy(0x8011)
                expect(state.V[0]).toEqual(0xf)
                expect(state.pc).toEqual(0x202)
            })
            it("e | 1", () => {
                initWithV({ 0: 0xe, 1: 1 })
                opcodes.orVy(0x8011)
                expect(state.V[0]).toEqual(0xf)
                expect(state.pc).toEqual(0x202)
            })

            it("f | f", () => {
                initWithV({ 0: 0xf, 1: 0xf })
                opcodes.orVy(0x8011)
                expect(state.V[0]).toEqual(0xf)
                expect(state.pc).toEqual(0x202)
            })
        })

        describe("AND", () => {
            it("0 | 0", () => {
                opcodes.andVy(0x8011)
                expect(state.V[0]).toEqual(0)
                expect(state.pc).toEqual(0x202)
            })

            it("0 | f", () => {
                initWithV({ 1: 0xf })
                opcodes.andVy(0x8011)
                expect(state.V[0]).toEqual(0)
                expect(state.pc).toEqual(0x202)
            })
            it("f | 0", () => {
                initWithV({ 0: 0xf })
                opcodes.andVy(0x8011)
                expect(state.V[0]).toEqual(0)
                expect(state.pc).toEqual(0x202)
            })
            it("f | f", () => {
                initWithV({ 0: 0xf, 1: 0xf })
                opcodes.andVy(0x8011)
                expect(state.V[0]).toEqual(0xf)
                expect(state.pc).toEqual(0x202)
            })
        })

        describe("XOR", () => {
            it("0 | 0", () => {
                opcodes.xorVy(0x8011)
                expect(state.V[0]).toEqual(0)
                expect(state.pc).toEqual(0x202)
            })

            it("0 | f", () => {
                initWithV({ 1: 0xf })
                opcodes.xorVy(0x8011)
                expect(state.V[0]).toEqual(0xf)
                expect(state.pc).toEqual(0x202)
            })
            it("f | 0", () => {
                initWithV({ 0: 0xf })
                opcodes.xorVy(0x8011)
                expect(state.V[0]).toEqual(0xf)
                expect(state.pc).toEqual(0x202)
            })
            it("f | f", () => {
                initWithV({ 0: 0xf, 1: 0xf })
                opcodes.xorVy(0x8011)
                expect(state.V[0]).toEqual(0)
                expect(state.pc).toEqual(0x202)
            })
        })
    })
})
