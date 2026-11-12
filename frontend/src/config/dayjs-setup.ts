import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

// Required by formats converted from the site's WordPress date setting:
// `advancedFormat` supplies `Do` (from PHP `jS`), and `customParseFormat`
// lets the pickers parse typed input back against a non-ISO format.
dayjs.extend(advancedFormat)
dayjs.extend(customParseFormat)

// Site-time <-> UTC conversion for stored dates (`siteDateTimeToUtc` and
// `utcToSiteDateTime` in `date-format`).
dayjs.extend(utc)
dayjs.extend(timezone)
