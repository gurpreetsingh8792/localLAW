import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import DashboardNavbar from '../../utilities/DashboardNavbar/DashboardNavbar';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const events = [
  {
    title: 'Meeting',
    allDay: true,
    start: new Date(2023, 10, 1),
    end: new Date(2023, 10, 1),
  },
  {
    title: 'Meeting',
    allDay: true,
    start: new Date(2023, 10, 1),
    end: new Date(2023, 10, 1),
  },
  {
    title: 'Meeting',
    allDay: true,
    start: new Date(2023, 10, 1),
    end: new Date(2023, 10, 1),
  },
  
];

const CalendarForm = () => {
  return (
    <div>
      <DashboardNavbar />
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, margin: "50px" }}
      />
    </div>
  );
};

export default CalendarForm;
