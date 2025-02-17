import { TimestampFormat } from "./timestamp-format.enum.ts";

/** Type representing logger options. */
export type LoggerOptions = {

    /** The logger's default symbol. */
    symbol?: string

    /**
     * The logger's timestamp format.
     *
     * Defaults to `TimestampFormat.CONDENSED_12` ("dd/MM/yyyy @ hh:mm:ss aa zzzz").
     * @see https://date-fns.org/docs/format
     */
    timestampFormat?: TimestampFormat | string,

    /**
     * The logger's message delimiter.
     *
     * Defaults to "::".
     */
    messageDelimiter?: string,

    /**
     * Flag indicating if context data should be output in a compact-style.
     *
     * Defaults to `false`.
     */
    compactContext?: boolean,

    /**
     * Flag indicating if errors should be thrown by default.
     *
     * Defaults to `false`.
     *
     * @note This does not affect `fatal` errors, which are **always** thrown.
     */
    throwErrors?: boolean,

    /**
     * Flag indicating if supressed (unlogged) errors should be thrown.
     *
     * Defaults to `false`.
     *
     * @note This requires `throwErrors` _or_ the error function's `throws`
     * flag to be `true`.
     *
     * @note This does not affect `fatal` errors, which are **always** thrown.
     */
    throwSupressedErrors?: boolean

}

export const LoggerOptionDefaults = {

    timestampFormat: TimestampFormat.CONDENSED_12,
    messageDelimiter: "::",
    compactContext: false,
    throwErrors: false,
    throwSupressedErrors: false

}
