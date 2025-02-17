import { blue, cyan, gray, red, white, yellow } from "@std/fmt/colors"
import { isArray, isPlainObject } from "is-what"
import { maxLength, minLengthOrApplyTrailingPad, sanitized } from "./utils/string.utils.ts"
import { LogLevel } from "./types/log-level.enum.ts"
import { LogLevelOperator } from "./types/log-level-operator.enum.ts"
import type { LogMessage } from "./types/log-message.type.ts"
import { type LoggerOptions, LoggerOptionDefaults } from "./types/logger-options.type.ts";
import { DateUtils } from "./utils/date.utils.ts";
import { TimestampFormat } from "./types/timestamp-format.enum.ts";

/**
 Class that outputs messages to the console.
 */
export class Logger {

    /**
     * The global log level.
     */
    public static level = LogLevel.DEBUG

    /**
     * The global log level operator.
     *
     * Defaults to `GREATER_OR_EQUAL`.
     */
    public static levelOperator = LogLevelOperator.GREATER_OR_EQUAL

    /**
     * Optional set of pre-determined categories to use for message alignment.
     */
    public static alignmentCategories?: string[]

    /**
     * Flag indicating if logging is enabled for this logger.
     */
    public isEnabled = true

    private readonly category?: string
    private readonly options: LoggerOptions

    /**
     * Constructs a logger.
     */
    constructor()

    /**
     * Constructs a logger with options.
     * @param options - Logger configuration options.
     */
    constructor(options: LoggerOptions)

    /**
     * Constructs a logger with an optional category & options.
     * @param category - An optional log category.
     * @param options - Optional logger configuration options.
     */
    constructor(category?: string, options?: LoggerOptions)

    constructor(

        arg1?: string | LoggerOptions,
        arg2?: LoggerOptions

    ) {

        let options: LoggerOptions | undefined

        if (arg1 && typeof arg1 === "string") {
            this.category = arg1
        }

        if (arg2) {
            options = arg2 as LoggerOptions
        }

        this.options = {
            ...LoggerOptionDefaults,
            ...options
        }

    }

    /**
     * Flag indicating if Deno environment logging is enabled.
     */
    public static isDenoLoggingEnabled(): boolean {

        if (Deno.env.get("NO_LOG")) {
            return false
        }

        return true

    }

    /**
     * Logs a message.
     * @param message - The message to log.
     * @param throws - Flag indicating if errors should be thrown while logging.
     * @returns The logged message, or `undefined` if nothing was logged.
     */
    public logMessage(

        message: LogMessage,
        throws?: boolean

    ): LogMessage | undefined {

        return this._log(
            message,
            throws ?? this.options.throwErrors!
        )

    }

    /**
     * Logs a message.
     * @param message - The message to log.
     * @param level - The desired log-level.
     * @param throwOnError - Flag indicating if errors should be thrown while logging.
     * @param ctx - Optional context data to attach to the message.
     * @returns The logged message, or `undefined` if nothing was logged.
     */
    public log(

        message: string,
        level: LogLevel,
        throws?: boolean,
        ctx?: any

    ): LogMessage | undefined {

        return this.logMessage(
            this.message(message, level, ctx),
            throws
        )

    }

    /**
     * Logs a debug message.
     * @param message - The message to log.
     * @param ctx - Optional context data to attach to the message.
     * @returns The logged message, or `undefined` if nothing was logged.
     */
    public debug(

        message: string,
        ctx?: any

    ): LogMessage | undefined {

        return this.log(
            message,
            LogLevel.DEBUG,
            false,
            ctx
        )

    }

    /**
     * Logs an info message.
     * @param message - The message to log.
     * @param ctx - Optional context data to attach to the message.
     * @returns The logged message, or `undefined` if nothing was logged.
     */
    public info(

        message: string,
        ctx?: any

    ): LogMessage | undefined {

        return this.log(
            message,
            LogLevel.INFO,
            false,
            ctx
        )

    }

    /**
     * Logs a warning message.
     * @param message - The message to log.
     * @param ctx - Optional context data to attach to the message.
     * @returns The logged message, or `undefined` if nothing was logged.
     */
    public warn(

        message: string,
        ctx?: any

    ): LogMessage | undefined {

        return this.log(
            message,
            LogLevel.WARN,
            false,
            ctx
        )

    }

    /**
     * Logs an error message.
     * @param message - The message to log.
     * @param ctx - Optional context data to attach to the message.
     * @returns The logged message, or `undefined` if nothing was logged.
     */
    public error(

        message: string,
        ctx?: any

    ): LogMessage | undefined {

        return this.log(
            message,
            LogLevel.ERROR,
            this.options.throwErrors,
            ctx
        )

    }

    /**
     * Logs & throws an error message.
     * @param message - The message to log.
     * @param ctx - Optional context data to attach to the message.
     * @returns The logged message, or `undefined` if nothing was logged.
     */
    public errorThrowing(

        message: string,
        ctx?: any

    ): LogMessage | undefined {

        return this.log(
            message,
            LogLevel.ERROR,
            true,
            ctx
        )

    }

    /**
     * Logs & throws a fatal message.
     * @param message - The message to log.
     * @param ctx - Optional context data to attach to the message.
     */
    public fatal(

        message: string,
        ctx?: any

    ) {

        this.log(
            message,
            LogLevel.FATAL,
            true,
            ctx
        )

    }

    /**
     * Logs a newline to the console.
     */
    public newline() {
        console.log()
    }

    /**
     * Creates an unlogged message.
     * @param message - The message.
     * @param level - The desired log-level.
     * @param ctx - Optional context data to attach to the message.
     * @returns An unlogged message.
     */
    public message(

        message: string,
        level: LogLevel,
        ctx?: any

    ): LogMessage {

        const date = new Date()

        const formatted = this.formatMessage(
            level,
            message,
            date,
            this.category,
            ctx
        )

        return {
            message,
            formatted,
            level,
            date,
            category: this.category,
            ctx
        }

    }

    // MARK: Private

    private canLog(level: LogLevel): boolean {

        if (
            !Logger.isDenoLoggingEnabled ||
            Logger.level === LogLevel.NONE ||
            !this.isEnabled ||
            level === LogLevel.NONE
        ) {
            return false
        }

        switch (Logger.levelOperator) {
        case LogLevelOperator.EQUAL: return level == Logger.level
        case LogLevelOperator.GREATER_OR_EQUAL: return level >= Logger.level
        case LogLevelOperator.LESS_OR_EQUAL: return level <= Logger.level
        }

    }

    private _log(

        message: LogMessage,
        throws: boolean

    ): LogMessage | undefined {

        if (!this.canLog(message.level)) {

            if (message.level >= LogLevel.ERROR && throws && this.options.throwSupressedErrors) {
                throw new Error(message.message)
            }

            return

        }

        switch (message.level) {
        case LogLevel.DEBUG: console.debug(message.formatted); break
        case LogLevel.INFO:  console.info(message.formatted); break
        case LogLevel.WARN:  console.warn(message.formatted); break
        case LogLevel.ERROR:

            console.error(message.formatted)

            if (throws) {
                throw new Error(message.message)
            }

            break

        case LogLevel.FATAL:

            console.error(message.formatted)
            throw new Error(message.message)

        }

        return message

    }

    private symbol(level: LogLevel): string {

        const colorizer = this.colorizer(level)

        const symbols = [
            "[DEBUG]",
            "[INFO]",
            "[WARN]",
            "[ERROR]",
            "[FATAL]"
        ]

        const length = maxLength(symbols)

        return colorizer(minLengthOrApplyTrailingPad(
            symbols[level],
            length
        ))

    }

    private colorizer(level: LogLevel): (text: string) => string {

        switch (level) {
        case LogLevel.NONE:  return (str) => str
        case LogLevel.DEBUG: return cyan
        case LogLevel.INFO:  return blue
        case LogLevel.WARN:  return yellow
        case LogLevel.ERROR: return red
        case LogLevel.FATAL: return red
        }

    }

    private formatMessage(

        level: LogLevel,
        message: string,
        date: Date,
        category?: string,
        ctx?: any

    ): string {

        let result = ""

        if (this.options!.timestampFormat && this.options!.timestampFormat != TimestampFormat.NONE) {

            const timestamp = DateUtils.format(
                date,
                this.options!.timestampFormat!
            )

            result = `${this.symbol(level)} ${white(timestamp)}`

        }
        else {
            result = this.symbol(level)
        }

        if (category) {
            result += ` ${yellow(`[${category}]`)}`
        }

        const colorizer = this.colorizer(level)

        // Message

        if ((Logger.alignmentCategories?.length ?? 0) > 0) {

            const categoryLength = sanitized(category ?? "").length
            const maxCategoryLength = maxLength(Logger.alignmentCategories ?? [])

            const count = category ?
                (maxCategoryLength - categoryLength) :
                (maxCategoryLength - categoryLength) + 3

            result += " ".repeat(count)

        }

        if (this.options.messageDelimiter) {
            result += ` ${this.options.messageDelimiter} ${colorizer(message)}`
        }
        else {
            result += ` ${colorizer(message)}`
        }

        // Context

        if (ctx) {

            const compact = this.options!.compactContext ?? LoggerOptionDefaults.compactContext

            const formattedCtx = this.formatValue(
                ctx,
                compact
            )

            if (compact || typeof ctx === "string") {

                if (this.options!.messageDelimiter) {
                    result += ` ${this.options.messageDelimiter} ${gray(formattedCtx)}`
                }
                else {
                    result += ` ${gray(formattedCtx)}`
                }

            }
            else {
                result += `\n${gray(formattedCtx)}`
            }

        }

        return result

    }

    private formatValue(

        value: any,
        compact: boolean,
        depth: number = 1

    ): string {

        if (isPlainObject(value)) {
            return this.formatObjectValue(value, compact, depth)
        }
        else if (isArray(value)) {
            return this.formatArrayValue(value, compact, depth)
        }

        return String(value)

    }

    private formatObjectValue(

        obj: any,
        compact: boolean,
        depth: number = 1

    ): string {

        const pairs = Object
            .entries(obj)

        let result = ""

        if (compact) {

            result = "{"

            for (let i = 0; i < pairs.length; i++) {

                const pair = pairs[i]
                const key = pair[0]
                const value = this.formatValue(pair[1], compact, depth + 1)
                const isLast = (i == pairs.length - 1)
                result += ` ${key}: ${value}${isLast ? "" : ","}`

            }

            result += " }"

        }
        else {

            const indent = 2
            const propertyIndent = " ".repeat(indent * depth)
            const bracketIndent  = propertyIndent.substring(0, propertyIndent.length - indent)

            result = "{\n"

            for (let i = 0; i < pairs.length; i++) {

                const pair = pairs[i]
                const key = pair[0]
                const value = this.formatValue(pair[1], compact, depth + 1)
                const isLast = (i == pairs.length - 1)
                result += `${propertyIndent}${key}: ${value}${isLast ? "" : ","}\n`

            }

            result += `${bracketIndent}}`

        }

        return result

    }

    private formatArrayValue(

        arr: any[],
        compact: boolean,
        depth: number = 1

    ): string {

        let result = ""

        if (compact) {

            result = "["

            for (let i = 0; i < arr.length; i++) {

                const isLast = (i == arr.length - 1)
                const value = this.formatValue(arr[i], compact, depth + 1)
                result += `${value}${isLast ? "" : ", "}`

            }

            result += "]"

        }
        else {

            const indent = 2
            const propertyIndent = " ".repeat(indent * depth)
            const bracketIndent  = propertyIndent.substring(0, propertyIndent.length - indent)

            result = "[\n"

            for (let i = 0; i < arr.length; i++) {

                const isLast = (i == arr.length - 1)
                const value = this.formatValue(arr[i], compact, depth + 1)
                result += `${propertyIndent}${value}${isLast ? "" : ","}\n`

            }

            result += `${bracketIndent}]`

        }

        return result

    }

}
