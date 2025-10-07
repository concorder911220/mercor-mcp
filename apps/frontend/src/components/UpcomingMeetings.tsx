import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Card, CardHeader, CardBody } from "./common/Card";
import ActionDropdown from "./common/ActionDropdown";
import ActionButton from "./common/ActionButton";
import { Meeting, MeetingsData } from "../redux/data-types/calendar";
import { useGetUpcomingEventsQuery } from "../redux/calender/calendarApi";
import RefreshIcon from "@mui/icons-material/Refresh";
// Remove MSGraphMeeting import - define locally

// Local MSGraph Meeting type
interface MSGraphMeeting {
  id: string;
  subject: string;
  start: { dateTime: string };
  end: { dateTime: string };
  attendees: Array<{
    emailAddress: { name: string; address: string };
    status: { response: string; time: string | null };
    type: string;
  }>;
  location: {
    displayName: string;
    locationType?: string;
  };
  "@odata.etag": string;
  organizer: {
    emailAddress: { name: string; address: string };
  };
}

// Styled components

const demoMeetingsData: {
  yesterday: MSGraphMeeting[];
  today: MSGraphMeeting[];
  tomorrow: MSGraphMeeting[];
} = {
  yesterday: [
    {
      id: "1",
      subject: "Client Call with the Thompson Family",
      start: { dateTime: "2025-06-15T09:00:00-07:00" },
      end: { dateTime: "2025-06-15T09:30:00-07:00" },
      attendees: [
        { emailAddress: { name: "Mark Thompson", address: "mark.thompson@example.com" }, status: { response: "none" as "none", time: null }, type: "required" },
        { emailAddress: { name: "Susan Thompson", address: "susan.thompson@example.com" }, status: { response: "none" as "none", time: null }, type: "required" },
      ],
      location: { displayName: "Teams Meeting", locationType: "default" },
      "@odata.etag": "",
      organizer: { emailAddress: { name: "Organizer", address: "organizer@example.com" } },
    },
    {
      id: "2",
      subject: "Initial Meeting with the Jones Family",
      start: { dateTime: "2025-06-15T10:00:00-07:00" },
      end: { dateTime: "2025-06-15T11:00:00-07:00" },
      attendees: [
        { emailAddress: { name: "Sam Jones", address: "sam.jones@example.com" }, status: { response: "none" as "none", time: null }, type: "required" },
        { emailAddress: { name: "Jin Jones", address: "jin.jones@example.com" }, status: { response: "none" as "none", time: null }, type: "required" },
      ],
      location: { displayName: "Teams Meeting", locationType: "default" },
      "@odata.etag": "",
      organizer: { emailAddress: { name: "Organizer", address: "organizer@example.com" } },
    },
  ],
  today: [
    {
      id: "3",
      subject: "Morning Sync with Strategy Team",
      start: { dateTime: "2025-06-16T08:00:00-07:00" },
      end: { dateTime: "2025-06-16T08:30:00-07:00" },
      attendees: [
        { emailAddress: { name: "Alice Johnson", address: "alice.johnson@example.com" }, status: { response: "none" as "none", time: null }, type: "required" },
        { emailAddress: { name: "Bob Lee", address: "bob.lee@example.com" }, status: { response: "none" as "none", time: null }, type: "required" },
      ],
      location: { displayName: "Teams Meeting", locationType: "default" },
      "@odata.etag": "",
      organizer: { emailAddress: { name: "Organizer", address: "organizer@example.com" } },
    },
    {
      id: "4",
      subject: "Check in with Bill Browder",
      start: { dateTime: "2025-06-16T09:00:00-07:00" },
      end: { dateTime: "2025-06-16T09:45:00-07:00" },
      attendees: [
        { emailAddress: { name: "Bill Browder", address: "bill.browder@example.com" }, status: { response: "none" as "none", time: null }, type: "required" },
        { emailAddress: { name: "Sam Browder", address: "sam.browder@example.com" }, status: { response: "none" as "none", time: null }, type: "required" },
      ],
      location: { displayName: "Teams Meeting", locationType: "default" },
      "@odata.etag": "",
      organizer: { emailAddress: { name: "Organizer", address: "organizer@example.com" } },
    },
    {
      id: "5",
      subject: "Portfolio Rebalance Discussion",
      start: { dateTime: "2025-06-16T11:00:00-07:00" },
      end: { dateTime: "2025-06-16T12:00:00-07:00" },
      attendees: [
        { emailAddress: { name: "Charlie Kim", address: "charlie.kim@example.com" }, status: { response: "none" as "none", time: null }, type: "required" },
      ],
      location: { displayName: "Office", locationType: "default" },
      "@odata.etag": "",
      organizer: { emailAddress: { name: "Organizer", address: "organizer@example.com" } },
    },
    {
      id: "6",
      subject: "Client Meeting - Portfolio Review",
      start: { dateTime: "2025-06-16T13:00:00-07:00" },
      end: { dateTime: "2025-06-16T14:00:00-07:00" },
      attendees: [
        { emailAddress: { name: "Sarah Thompson", address: "sarah.thompson@example.com" }, status: { response: "none" as "none", time: null }, type: "required" },
      ],
      location: { displayName: "Office", locationType: "default" },
      "@odata.etag": "",
      organizer: { emailAddress: { name: "Organizer", address: "organizer@example.com" } },
    },
    {
      id: "7",
      subject: "Client Meeting - Investment Strategy",
      start: { dateTime: "2025-06-16T15:00:00-07:00" },
      end: { dateTime: "2025-06-16T16:00:00-07:00" },
      attendees: [
        { emailAddress: { name: "Michael Chen", address: "michael.chen@example.com" }, status: { response: "none" as "none", time: null }, type: "required" },
      ],
      location: { displayName: "Office", locationType: "default" },
      "@odata.etag": "",
      organizer: { emailAddress: { name: "Organizer", address: "organizer@example.com" } },
    },
  ],
  tomorrow: [
    {
      id: "8",
      subject: "Retirement Planning Session",
      start: { dateTime: "2025-06-17T10:00:00-07:00" },
      end: { dateTime: "2025-06-17T11:00:00-07:00" },
      attendees: [
        { emailAddress: { name: "Dana White", address: "dana.white@example.com" }, status: { response: "none" as "none", time: null }, type: "required" },
      ],
      location: { displayName: "Office", locationType: "default" },
      "@odata.etag": "",
      organizer: { emailAddress: { name: "Organizer", address: "organizer@example.com" } },
    },
  ],
};
const DateBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  width: 48,
  height: 48,
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
}));

const CustomCardBody = styled(CardBody)(({ theme }) => ({
  "&::-webkit-scrollbar": {
    width: 8,
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.grey[200],
    borderRadius: 3,
  },
}));

export function UpcomingMeetings() {
  const theme = useTheme();
  const todayRef = React.useRef<HTMLDivElement>(null);

  const { data, isLoading } = useGetUpcomingEventsQuery({
    email: "test@rialto-financial.com",
  });

  const scrollToToday = () => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const formatTime = (dateTime: string) => {
    const date = new Date(dateTime);
    // Convert UTC timestamp to PST
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Los_Angeles", // PST/PDT timezone
    });
  };

  const formatDate = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      month: date.toLocaleString("default", { month: "long" }),
      day: date.getDate().toString(),
    };
  };

  const [sections, setSections] = useState<
    { title: string; meetings: MSGraphMeeting[] }[]
  >([
    { title: "Yesterday", meetings: [] },
    { title: "Today", meetings: [] },
    { title: "Tomorrow", meetings: [] },
  ]);

  // Helper to map API meeting to MSGraphMeeting
  const mapApiMeetingToMSGraphMeeting = (meeting: any): MSGraphMeeting => ({
    id: meeting.id,
    subject: meeting.title ?? "",
    start: { dateTime: meeting.start_time },
    end: { dateTime: meeting.end_time },
    attendees: (meeting.attendees ?? []).map((name: string) => ({
      emailAddress: { name, address: "" },
      status: { response: "none", time: null },
      type: "required",
    })),
    location: { displayName: meeting.location ?? "", locationType: "default" },
    "@odata.etag": "",
    organizer: { emailAddress: { name: "", address: "" } },
  });

  useEffect(() => {
    if (!data) return;
    setSections([
      {
        title: "Yesterday",
        meetings: Array.isArray(data.yesterday)
          ? data.yesterday.map(mapApiMeetingToMSGraphMeeting)
          : [],
      },
      {
        title: "Today",
        meetings: Array.isArray(data.today)
          ? data.today.map(mapApiMeetingToMSGraphMeeting)
          : [],
      },
      {
        title: "Tomorrow",
        meetings: Array.isArray(data.tomorrow)
          ? data.tomorrow.map(mapApiMeetingToMSGraphMeeting)
          : [],
      },
    ]);
  }, [data]);

  useEffect(() => {
  if (data && (data.yesterday?.length || data.today?.length || data.tomorrow?.length)) {
    setSections([
      {
        title: "Yesterday",
        meetings: Array.isArray(data.yesterday)
          ? data.yesterday.map(mapApiMeetingToMSGraphMeeting)
          : [],
      },
      {
        title: "Today",
        meetings: Array.isArray(data.today)
          ? data.today.map(mapApiMeetingToMSGraphMeeting)
          : [],
      },
      {
        title: "Tomorrow",
        meetings: Array.isArray(data.tomorrow)
          ? data.tomorrow.map(mapApiMeetingToMSGraphMeeting)
          : [],
      },
    ]);
  } else {
    setSections([
      { title: "Yesterday", meetings: demoMeetingsData.yesterday },
      { title: "Today", meetings: demoMeetingsData.today },
      { title: "Tomorrow", meetings: demoMeetingsData.tomorrow },
    ]);
  }
}, [data]);

  return (
    <>
      {!isLoading && (
        <Card>
          <CardHeader sx={{ px: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" sx={{ textAlign: "left", flexGrow: 1 }}>
                Upcoming Meetings
              </Typography>
              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <ActionButton onClick={scrollToToday}>Today</ActionButton>
                <ActionButton onClick={() => {}}>
                  <RefreshIcon sx={{ fontSize: 16 }} />
                </ActionButton>
                <ActionDropdown
                  label="Client Meetings"
                  options={[
                    { label: "All Meetings", onClick: () => {} },
                    { label: "Client Meetings", onClick: () => {} },
                    { label: "Internal Meetings", onClick: () => {} },
                  ]}
                />
              </Box>
            </Box>
          </CardHeader>
          <CustomCardBody
            sx={{ px: 2, py: 2, maxHeight: "70vh", overflowY: "auto" }}
          >
            {sections.map((section, idx) => (
              <React.Fragment key={section.title}>
                {section.meetings.length > 0 && (
                  <>
                    <Box
                      ref={section.title === "Today" ? todayRef : null}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                        gap: 2,
                      }}
                    >
                      {section.meetings[0] && (
                        <DateBox>
                          <Typography variant="caption">
                            {
                              formatDate(section.meetings[0].start.dateTime)
                                .month
                            }
                          </Typography>
                          <Typography variant="h6" sx={{ lineHeight: 1 }}>
                            {formatDate(section.meetings[0].start.dateTime).day}
                          </Typography>
                        </DateBox>
                      )}
                      <Typography variant="h6" color="text.primary">
                        {section.title}
                      </Typography>
                    </Box>
                    {section.meetings.map((meeting) => {
                      const timeRange = `${formatTime(
                        meeting.start.dateTime
                      )} - ${formatTime(meeting.end.dateTime)}`;
                      const attendees =
                        meeting.attendees
                          .map((a) => a.emailAddress.name)
                          .join(", ") || "No attendees";

                      return (
                        <Box
                          key={meeting.id}
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            backgroundColor: "background.paper",
                            p: 2,
                            mb: 2,
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              color: "text.secondary",
                              fontSize: 14,
                              width: 150,
                              textAlign: "left",
                            }}
                          >
                            {timeRange}
                          </Typography>
                          <Box sx={{ flex: 1, ml: 1 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 500, color: "text.primary" }}
                            >
                              {meeting.subject}
                            </Typography>
                            <Typography
                              sx={{
                                color: "text.secondary",
                                fontSize: 13,
                                mt: 0.5,
                              }}
                            >
                              {attendees}
                            </Typography>
                          </Box>
                          <Box sx={{ ml: 2, flexShrink: 0 }}>
                            <ActionButton>
                              {meeting.location.displayName.includes("Teams")
                                ? "Join Teams"
                                : "Prep meeting"}
                            </ActionButton>
                          </Box>
                        </Box>
                      );
                    })}
                  </>
                )}
              </React.Fragment>
            ))}
          </CustomCardBody>
        </Card>
      )}
    </>
  );
}
