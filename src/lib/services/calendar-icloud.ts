import "server-only"

import type {
  CalendarEvent,
  CalendarProvider,
  CalendarType,
} from "@/types/integrations"

const ICLOUD_BASE_URL = "https://caldav.icloud.com"

function getRequiredEnv(name: "ICLOUD_USERNAME" | "ICLOUD_APP_PASSWORD") {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function getAuthHeader() {
  const credentials = `${getRequiredEnv("ICLOUD_USERNAME")}:${getRequiredEnv("ICLOUD_APP_PASSWORD")}`
  return `Basic ${Buffer.from(credentials).toString("base64")}`
}

async function caldavRequest(path: string, init: RequestInit) {
  const response = await fetch(new URL(path, ICLOUD_BASE_URL), {
    ...init,
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/xml; charset=utf-8",
      Depth: "0",
      ...(init.headers || {}),
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`iCloud CalDAV request failed with status ${response.status}.`)
  }

  return response.text()
}

function decodeXml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
}

function extractFirstTagValue(xml: string, tagName: string) {
  const pattern = new RegExp(
    `<(?:[\\w-]+:)?${tagName}[^>]*>([\\s\\S]*?)</(?:[\\w-]+:)?${tagName}>`,
    "i"
  )
  const match = xml.match(pattern)
  return match ? decodeXml(match[1].trim()) : null
}

function extractResponses(xml: string) {
  return [...xml.matchAll(/<(?:[\w-]+:)?response\b[^>]*>([\s\S]*?)<\/(?:[\w-]+:)?response>/gi)]
    .map((match) => match[0])
}

function unfoldICalLines(value: string) {
  return value.replace(/\r?\n[ \t]/g, "")
}

function parseProperty(rawLine: string) {
  const separatorIndex = rawLine.indexOf(":")

  if (separatorIndex < 0) {
    return null
  }

  const head = rawLine.slice(0, separatorIndex)
  const value = rawLine.slice(separatorIndex + 1)
  const [name, ...params] = head.split(";")

  const parameters = Object.fromEntries(
    params.map((param) => {
      const [key, paramValue = ""] = param.split("=")
      return [key.toUpperCase(), paramValue]
    })
  )

  return {
    name: name.toUpperCase(),
    parameters,
    value,
  }
}

function parseICalDate(rawValue: string) {
  if (/^\d{8}$/.test(rawValue)) {
    const year = Number(rawValue.slice(0, 4))
    const month = Number(rawValue.slice(4, 6)) - 1
    const day = Number(rawValue.slice(6, 8))
    return new Date(Date.UTC(year, month, day, 0, 0, 0))
  }

  const compact = rawValue.replace("Z", "")

  if (!/^\d{8}T\d{6}$/.test(compact)) {
    return new Date(rawValue)
  }

  const year = Number(compact.slice(0, 4))
  const month = Number(compact.slice(4, 6)) - 1
  const day = Number(compact.slice(6, 8))
  const hour = Number(compact.slice(9, 11))
  const minute = Number(compact.slice(11, 13))
  const second = Number(compact.slice(13, 15))

  if (rawValue.endsWith("Z")) {
    return new Date(Date.UTC(year, month, day, hour, minute, second))
  }

  return new Date(year, month, day, hour, minute, second)
}

function parseEventsFromCalendarData(
  calendarData: string,
  calendarType: CalendarType
) {
  const unfolded = unfoldICalLines(calendarData)
  const eventMatches = unfolded.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/gim) || []

  return eventMatches
    .map((block) => {
      const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
      let id = ""
      let title = "(No title)"
      let startAt: Date | null = null
      let endAt: Date | null = null
      let location: string | null = null
      let isAllDay = false
      const attendees: string[] = []

      for (const line of lines) {
        const property = parseProperty(line)

        if (!property) {
          continue
        }

        switch (property.name) {
          case "UID":
            id = property.value.trim()
            break
          case "SUMMARY":
            title = property.value.trim() || "(No title)"
            break
          case "DTSTART":
            isAllDay = property.parameters.VALUE === "DATE"
            startAt = parseICalDate(property.value.trim())
            break
          case "DTEND":
            endAt = parseICalDate(property.value.trim())
            break
          case "LOCATION":
            location = property.value.trim() || null
            break
          case "ATTENDEE": {
            const attendee = property.parameters.CN?.trim() || property.value.replace(/^mailto:/i, "").trim()
            if (attendee) {
              attendees.push(attendee)
            }
            break
          }
          default:
            break
        }
      }

      if (!id || !startAt) {
        return null
      }

      const finalEndAt =
        endAt ||
        new Date(
          startAt.getTime() + (isAllDay ? 24 * 60 * 60 * 1000 : 30 * 60 * 1000)
        )

      return {
        id,
        provider: "icloud" as const,
        title,
        startAt,
        endAt: finalEndAt,
        attendees,
        location,
        calendarType,
        isAllDay,
      } as CalendarEvent
    })
    .filter((event): event is NonNullable<typeof event> => Boolean(event))
}

async function discoverCurrentUserPrincipal() {
  const xml = await caldavRequest("/", {
    method: "PROPFIND",
    body: `<?xml version="1.0" encoding="utf-8" ?>
      <d:propfind xmlns:d="DAV:">
        <d:prop>
          <d:current-user-principal />
        </d:prop>
      </d:propfind>`,
  })

  const principal = extractFirstTagValue(xml, "href")

  if (!principal) {
    throw new Error("Unable to resolve iCloud CalDAV principal.")
  }

  return principal
}

async function discoverCalendarHome(principalPath: string) {
  const xml = await caldavRequest(principalPath, {
    method: "PROPFIND",
    body: `<?xml version="1.0" encoding="utf-8" ?>
      <d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
        <d:prop>
          <c:calendar-home-set />
        </d:prop>
      </d:propfind>`,
  })

  const home = extractFirstTagValue(xml, "calendar-home-set")
  const href = home ? extractFirstTagValue(home, "href") : null

  if (!href) {
    throw new Error("Unable to resolve iCloud calendar home set.")
  }

  return href
}

async function discoverCalendars(calendarHomePath: string) {
  const xml = await caldavRequest(calendarHomePath, {
    method: "PROPFIND",
    headers: {
      Depth: "1",
    },
    body: `<?xml version="1.0" encoding="utf-8" ?>
      <d:propfind xmlns:d="DAV:">
        <d:prop>
          <d:displayname />
          <d:resourcetype />
        </d:prop>
      </d:propfind>`,
  })

  return extractResponses(xml)
    .map((responseXml) => {
      const href = extractFirstTagValue(responseXml, "href")
      const resourceType = extractFirstTagValue(responseXml, "resourcetype")
      const isCalendar = /<(?:[\w-]+:)?calendar\b/i.test(resourceType || "")

      if (!href || !isCalendar) {
        return null
      }

      return href
    })
    .filter((calendar): calendar is string => Boolean(calendar))
}

function formatCaldavDate(date: Date) {
  return date
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(/\.\d{3}Z$/, "Z")
}

async function fetchCalendarEvents(
  calendarPath: string,
  from: Date,
  to: Date,
  calendarType: CalendarType
) {
  const xml = await caldavRequest(calendarPath, {
    method: "REPORT",
    headers: {
      Depth: "1",
    },
    body: `<?xml version="1.0" encoding="utf-8" ?>
      <c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
        <d:prop>
          <d:getetag />
          <c:calendar-data />
        </d:prop>
        <c:filter>
          <c:comp-filter name="VCALENDAR">
            <c:comp-filter name="VEVENT">
              <c:time-range start="${formatCaldavDate(from)}" end="${formatCaldavDate(to)}" />
            </c:comp-filter>
          </c:comp-filter>
        </c:filter>
      </c:calendar-query>`,
  })

  return extractResponses(xml).flatMap((responseXml) => {
    const calendarData = extractFirstTagValue(responseXml, "calendar-data")
    return calendarData
      ? parseEventsFromCalendarData(calendarData, calendarType)
      : []
  })
}

export class ICloudCalendarProvider implements CalendarProvider {
  constructor(private readonly calendarType: CalendarType = "work") {}

  async getEvents(from: Date, to: Date): Promise<CalendarEvent[]> {
    const principalPath = await discoverCurrentUserPrincipal()
    const calendarHomePath = await discoverCalendarHome(principalPath)
    const calendars = await discoverCalendars(calendarHomePath)

    const events = await Promise.all(
      calendars.map((calendar) =>
        fetchCalendarEvents(calendar, from, to, this.calendarType)
      )
    )

    return events.flat()
  }
}
