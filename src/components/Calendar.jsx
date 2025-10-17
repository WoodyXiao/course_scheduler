import React, { useState, useMemo } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const customStyles = `
  .rbc-toolbar {
    display: none !important;
  }
  
  .rbc-today {
    background-color: transparent !important;
  }
  
  .rbc-header {
    background-color: #f8fafc !important;
    color: #374151 !important;
    font-weight: 600 !important;
    font-size: 12px !important;
    padding: 6px 4px !important;
    border-bottom: 1px solid #e5e7eb !important;
    border-right: 1px solid #e5e7eb !important;
    text-align: center !important;
    line-height: 1.1 !important;
    height: 32px !important;
    min-height: 32px !important;
    max-height: 32px !important;
  }
  
  .rbc-time-view .rbc-header {
    background-color: #f8fafc !important;
    color: #374151 !important;
    border-right: 1px solid #e5e7eb !important;
    height: 32px !important;
    min-height: 32px !important;
    max-height: 32px !important;
  }

  .rbc-time-view .rbc-header:last-child {
    border-right: none !important;
  }
  
  .rbc-time-slot {
    color: #6b7280 !important;
    font-size: 12px !important;
    font-weight: 500 !important;
  }
  
  .rbc-time-content {
    border-top: 1px solid #e5e7eb !important;
  }

  .rbc-time-view .rbc-timeslot-group {
    border-bottom: 1px solid #f3f4f6 !important;
  }
  
  .rbc-time-view .rbc-time-gutter {
    background-color: #fafbfc !important;
    border-right: 1px solid #e5e7eb !important;
  }

  .rbc-time-view .rbc-day-bg {
    border-right: 1px solid #f3f4f6 !important;
  }
  
  .rbc-time-view .rbc-day-bg:last-child {
    border-right: none !important;
  }

  .rbc-time-view .rbc-header + .rbc-time-content {
    border-top: 1px solid #e5e7eb !important;
  }

  .rbc-time-view .rbc-header-overlay {
    height: 32px !important;
    min-height: 32px !important;
    max-height: 32px !important;
  }

  .rbc-time-view .rbc-time-content {
    border-top: 1px solid #e5e7eb !important;
    margin-top: 0 !important;
  }

  .rbc-time-view .rbc-time-gutter {
    border-right: 1px solid #e5e7eb !important;
    width: 60px !important;
  }

  .rbc-event-label {
    display: none !important;
  }
  
  .rbc-event-content {
    font-size: 12px !important;
    font-weight: 600 !important;
    padding: 4px 8px !important;
  }
  
  .rbc-event-time {
    display: none !important;
  }
  
  .rbc-event .rbc-event-time {
    display: none !important;
  }
  
  .rbc-event .rbc-event-label {
    display: none !important;
  }
  
  .rbc-event:hover {
    opacity: 0.9 !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  }
  
  .rbc-event {
    transition: all 0.2s ease !important;
    border-radius: 6px !important;
    border: none !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08) !important;
  }
  
  .rbc-calendar {
    background: white !important;
    border-radius: 8px !important;
    border: 1px solid #e5e7eb !important;
    overflow: hidden !important;
  }
  
  .rbc-time-content::-webkit-scrollbar {
    width: 6px;
  }
  
  .rbc-time-content::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  
  .rbc-time-content::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  .rbc-time-content::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
  
  .rbc-timeslot-group {
    min-height: 50px !important;
  }
  
  .rbc-events-container {
    margin-right: 0 !important;
  }
`;

const localizer = momentLocalizer(moment);

const EventComponent = ({ event }) => {
  return (
    <div className="rbc-event-content" style={{ 
      fontSize: '12px', 
      fontWeight: '600',
      padding: '4px 8px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      color: '#ffffff',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
      lineHeight: '1.2'
    }}>
      {event.title}
    </div>
  );
};

const Calendar = ({ courseSchedule }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const assignColorsToEvents = (events) => {
    const softColors = [
      '#6B73FF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
      '#85C1E9', '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D2B4DE'
    ];
    
    const courseColorMap = new Map();
    let colorIndex = 0;
    
    events.forEach((event) => {
      const courseName = event.title.split(' (')[0];
      
      if (!courseColorMap.has(courseName)) {
        const assignedColor = softColors[colorIndex % softColors.length];
        courseColorMap.set(courseName, assignedColor);
        colorIndex++;
      }
      
      event.resource.color = courseColorMap.get(courseName);
    });
    return events;
  };


  const events = useMemo(() => {
    if (!courseSchedule || !Array.isArray(courseSchedule)) {
      return [];
    }

    const rawEvents = courseSchedule.flatMap((course) => {
      if (!course.scheduleEntries || !Array.isArray(course.scheduleEntries)) {
        return [];
      }

      return course.scheduleEntries.map((entry, index) => {
        const startTime = entry.startTime || entry.start || entry.timeStart;
        const endTime = entry.endTime || entry.end || entry.timeEnd;
        
        if (!startTime || !endTime) {
          return null;
        }

        let startHour, startMin, endHour, endMin;
        
        try {
          [startHour, startMin] = startTime.split(":").map(Number);
          [endHour, endMin] = endTime.split(":").map(Number);
        } catch (error) {
          return null;
        }
        
        const dayMap = {
          Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6, Su: 0
        };
        
        const today = moment();
        const startOfWeek = today.clone().startOf('week');
        const eventDate = startOfWeek.clone().add(dayMap[entry.day], 'days');
        
        const startDateTime = eventDate.clone()
          .hour(startHour)
          .minute(startMin)
          .second(0);
        
        const endDateTime = eventDate.clone()
          .hour(endHour)
          .minute(endMin)
          .second(0);

        return {
          id: `${course.courseName}-${entry.day}-${index}`,
          title: `${course.courseName} (${entry.type?.toUpperCase() || 'COURSE'})`,
          start: startDateTime.toDate(),
          end: endDateTime.toDate(),
          resource: {
            course: course,
            entry: entry,
            color: '#3B82F6',
            details: `Lecture: ${course.lecture || 'N/A'}, Lab: ${course.lab || 'N/A'}, Campus: ${entry.campus || 'N/A'}`
          }
        };
      }).filter(Boolean);
    });

    return assignColorsToEvents(rawEvents);
  }, [courseSchedule]);

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.resource.color,
        borderRadius: '8px',
        border: 'none',
        color: '#ffffff',
        fontSize: '12px',
        fontWeight: '600',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        opacity: '0.9',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
      }
    };
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const closeEventDetails = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="calendar-container w-full" style={{ height: '400px', overflow: 'hidden' }}>
      <style>{customStyles}</style>
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%', overflow: 'hidden' }}
        views={['week']}
        defaultView="week"
        step={30}
        timeslots={2}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent
        }}
        min={new Date(2024, 0, 1, 7, 0, 0)} // 7:00 AM
        max={new Date(2024, 0, 1, 20, 0, 0)} // 8:00 PM
        dayLayoutAlgorithm="no-overlap"
        toolbar={false}
        showMultiDayTimes={false}
        showAllEvents={false}
        popup={false}
        doShowMoreDrillDown={false}
        drilldownView={null}
        onNavigate={() => {}}
        onView={() => {}}
      />
      
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="rounded-lg p-6 max-w-md w-full mx-4 shadow-lg text-white"
            style={{ 
              backgroundColor: selectedEvent.resource.color,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{selectedEvent.title}</h3>
              <button
                onClick={closeEventDetails}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white font-medium">
                  {moment(selectedEvent.start).format('HH:mm')} - {moment(selectedEvent.end).format('HH:mm')}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-white font-medium">
                  {moment(selectedEvent.start).format('dddd, MMMM Do')}
                </span>
              </div>
              
              <div className="bg-white bg-opacity-20 rounded p-3">
                <p className="text-white text-sm">
                  <strong>Details:</strong> {selectedEvent.resource.details}
                </p>
              </div>
              
              <div className="flex items-center justify-between bg-white bg-opacity-20 rounded p-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span className="text-white font-medium">Priority: {selectedEvent.resource.course.priority}</span>
                </div>
                <div className="flex space-x-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < selectedEvent.resource.course.priority 
                          ? 'bg-white' 
                          : 'bg-white bg-opacity-30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={closeEventDetails}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded transition-all duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;