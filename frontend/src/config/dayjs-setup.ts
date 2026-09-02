import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat'

// Required by formats converted from the site's WordPress date setting:
// `advancedFormat` supplies `Do` (from PHP `jS`), and `customParseFormat`
// lets the pickers parse typed input back against a non-ISO format.
dayjs.extend(advancedFormat)
dayjs.extend(customParseFormat)
