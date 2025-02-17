import { expect } from "@std/expect"
import { Logger, LogLevel, LogLevelOperator } from "../src/mod.ts"

const logger = new Logger("Test")

Deno.test("Debug message is logged", () => {

    const message = "Hello, world!"
    const output = logger.debug(message)

    expect(output).toBeDefined()
    expect(output!.message).toBe(message)
    expect(output!.level).toBe(LogLevel.DEBUG)

})

Deno.test("Info message is logged", () => {

    const message = "Hello, world!"
    const output = logger.info(message)

    expect(output).toBeDefined()
    expect(output!.message).toBe(message)
    expect(output!.level).toBe(LogLevel.INFO)

})

Deno.test("Warning message is logged", () => {

    const message = "Hello, world!"
    const output = logger.warn(message)

    expect(output).toBeDefined()
    expect(output!.message).toBe(message)
    expect(output!.level).toBe(LogLevel.WARN)

})

Deno.test("Error message is logged", () => {

    const message = "Hello, world!"
    const output = logger.error(message)

    expect(output).toBeDefined()
    expect(output!.message).toBe(message)
    expect(output!.level).toBe(LogLevel.ERROR)

})

Deno.test("Error message is thrown", () => {

    const message = "Hello, world!"

    try {
        const _ = logger.errorThrowing(message)
    }
    catch(err) {

        expect(err).toBeDefined()
        return

    }

    throw new Error("Error was never thrown")

})

Deno.test("Fatal message is thrown", () => {

    const message = "Hello, world!"

    try {
        const _ = logger.fatal(message)
    }
    catch(err) {

        expect(err).toBeDefined()
        return

    }

    throw new Error("Fatal error was never thrown")

})

Deno.test('Create a deferred message', () => {

    const message = "Hello, world!"
    const level = LogLevel.INFO

    const logMessage = logger.message(
        message,
        level
    )

    expect(logMessage).toBeDefined()
    expect(logMessage.message).toBe(message)
    expect(logMessage.level).toBe(level)

})

Deno.test('Log a deferred message', () => {

    const deferredMessage = logger.message(
        "Hello, world!",
        LogLevel.INFO
    )

    const loggedMessage = logger
        .logMessage(deferredMessage)

    expect(loggedMessage).toBeDefined()
    expect(loggedMessage!.message).toBe(deferredMessage.message)
    expect(loggedMessage!.formatted).toBe(deferredMessage.formatted)
    expect(loggedMessage!.level).toBe(deferredMessage.level)

})

Deno.test("Logger doesn't log when disabled", () => {

    logger.isEnabled = false
    const output = logger.info("Hello, world!")
    logger.isEnabled = true

    expect(output).toBeUndefined()

})

Deno.test("Logger only outputs messages ≥ a minimum level", () => {

    Logger.level = LogLevel.WARN
    Logger.levelOperator = LogLevelOperator.GREATER_OR_EQUAL

    const infoOutput = logger.info("Hello, info!")
    const warnOutput = logger.warn("Hello, warn!")
    const errorOutput = logger.error("Hello, error!")

    Logger.level = LogLevel.DEBUG
    Logger.levelOperator = LogLevelOperator.GREATER_OR_EQUAL

    expect(infoOutput).toBeUndefined()
    expect(warnOutput).toBeDefined()
    expect(errorOutput).toBeDefined()

})

Deno.test("Logger only outputs messages == to a specific level", () => {

    Logger.level = LogLevel.ERROR
    Logger.levelOperator = LogLevelOperator.EQUAL

    const infoOutput = logger.info("Hello, info!")
    const warnOutput = logger.warn("Hello, warn!")
    const errorOutput = logger.error("Hello, error!")

    Logger.level = LogLevel.DEBUG
    Logger.levelOperator = LogLevelOperator.GREATER_OR_EQUAL

    expect(infoOutput).toBeUndefined()
    expect(warnOutput).toBeUndefined()
    expect(errorOutput).toBeDefined()

})

Deno.test("Logger only outputs messages <= to a maximum level", () => {

    Logger.level = LogLevel.INFO
    Logger.levelOperator = LogLevelOperator.LESS_OR_EQUAL

    const debugOutput = logger.debug("Hello, debug!")
    const infoOutput = logger.info("Hello, info!")
    const warnOutput = logger.warn("Hello, warn!")

    Logger.level = LogLevel.DEBUG
    Logger.levelOperator = LogLevelOperator.GREATER_OR_EQUAL

    expect(debugOutput).toBeDefined()
    expect(infoOutput).toBeDefined()
    expect(warnOutput).toBeUndefined()

})

Deno.test("Log messages use a custom delimiter", () => {

    const customLogger = new Logger("", { messageDelimiter: "⭐️" })
    const output = customLogger.info("Hello, world!")

    expect(output).toBeDefined()
    expect(output!.formatted).toContain("⭐️")
    expect(output!.formatted).not.toContain("::")

})

Deno.test("Log messages without a delimiter", () => {

    const customLogger = new Logger("", { messageDelimiter: undefined })
    const output = customLogger.info("Hello, world!")

    expect(output).toBeDefined()
    expect(output!.formatted).not.toContain("::")

})

Deno.test("Log messages with context data", () => {

    const id = crypto.randomUUID()

    const output = logger.info("Hello, world", {
        id: id
    })

    expect(output?.ctx?.id).toBe(id)

})
