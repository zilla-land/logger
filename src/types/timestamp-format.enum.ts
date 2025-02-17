/** Representation of the various preset timestamp formats. */
export enum TimestampFormat {

    NONE = "_none",
    FULL_24 = "EEE, LLL dd yyyy @ HH:mm:ss zzzz",
    FULL_12 = "EEE, LLL dd yyyy @ hh:mm:ss aa zzzz",
    CONDENSED_24 = "MM/dd/yyyy @ HH:mm:ss zzzz",
    CONDENSED_12 = "MM/dd/yyyy @ hh:mm:ss aa zzzz",
    MINIMAL_24 = "MM/dd/yyyy @ HH:mm:ss",
    MINIMAL_12 = "MM/dd/yyyy @ hh:mm:ss aa",
    TIME_24 = "HH:mm:ss",
    TIME_12 = "hh:mm:ss aa"

}
