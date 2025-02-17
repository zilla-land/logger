import { Logger, LogLevel } from "../src/mod.ts"

const logger = new Logger("Demo")

const deferred = logger.message(
    "Hello, deferred message!",
    LogLevel.DEBUG
)

logger.debug("Hello, debug!")
logger.info("Hello, info!")
logger.warn("Hello, warning!")
logger.error("Hello, error!")

logger.info("Hello, message with context!", {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    message: "Suh Dude"
})

logger.logMessage(deferred)

try {
    logger.fatal("Hello, fatal!")
}
catch (error) {

    logger.newline()
    console.log(`>> Caught fatal - ${(error as Error).message}`)

}
