// Import types from generated backend schema
import { components } from '../../types/backend-schema';

// Use backend schema types for our API
export type Meeting = components['schemas']['Meeting'];
export type MeetingRecap = components['schemas']['MeetingRecap'];
export type CreateMeetingRequest = components['schemas']['CreateMeetingRequest'];
export type UpdateMeetingRequest = components['schemas']['UpdateMeetingRequest'];

// Keep existing Microsoft Graph types for external API compatibility
export interface EmailAddress {
    address: string;
    name: string;
}

export interface Attendee {
    emailAddress: EmailAddress;
    status: {
        response: "none" | "accepted" | "declined" | "tentative";
        time: string | null;
    };
    // type: "required" | "optional";
    type: string
}

export interface DateTime {
    dateTime: string;
    // timeZone: string | null;
}

export interface Location {
    address?: Record<string, unknown>;
    coordinates?: Record<string, unknown>;
    displayName: string;
    locationType: string;
    uniqueId?: string;
    uniqueIdType?: string;
}

export interface MSGraphMeeting {
    "@odata.etag": string;
    attendees: Attendee[];
    end: DateTime;
    id: string;
    location: Location;
    organizer: {
        emailAddress: EmailAddress;
    };
    start: DateTime;
    subject: string;
}

export interface MeetingsData {
    today: Meeting[];
    tomorrow: Meeting[];
    yesterday: Meeting[];
}