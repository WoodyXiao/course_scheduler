import React, { useRef, useEffect, useState } from "react";
import { extractCourseNum } from "../utils/utils";

const Calendar = ({ courseSchedule }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 700 });
  const [selectedEvent, setSelectedEvent] = useState(null);

  const getColorByCourse = (index) => {
    const hue = index * 137.508;
    return `hsl(${hue % 360}, 50%, 70%)`;
  };

  const events = courseSchedule.flatMap((course) => {
    return course.scheduleEntries.map((entry) => ({
      title: `${course.courseName} (${entry.type.toUpperCase()})`,
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      color: getColorByCourse(extractCourseNum(course.courseName)),
      details: `Lecture: ${course.lecture}, Lab: ${course.lab}, Campus: ${entry.campus}`,
    }));
  });

  const updateSize = () => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }
  };

  useEffect(() => {
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const timeToYPosition = (
    time,
    startHour = 7,
    hourHeight = dimensions.height / 13
  ) => {
    const [hours, minutes] = time.split(":").map(Number);
    return ((hours - startHour) * 60 + minutes) * (hourHeight / 60);
  };

  const dayMap = {
    Mo: "Monday",
    Tu: "Tuesday",
    We: "Wednesday",
    Th: "Thursday",
    Fr: "Friday",
    Sa: "Saturday",
    Su: "Sunday",
  };

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const timeLabelWidth = 50;
    const dayWidth = (dimensions.width - timeLabelWidth) / 5;
    const headerHeight = 30;

    events.forEach((event) => {
      const dayIndex = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ].indexOf(dayMap[event.day]);
      if (dayIndex === -1) return; // skip if day is not a weekday
      const startX = timeLabelWidth + dayWidth * dayIndex;
      const startY = headerHeight + timeToYPosition(event.startTime);
      const endY = headerHeight + timeToYPosition(event.endTime);
      if (x >= startX && x <= startX + dayWidth && y >= startY && y <= endY) {
        setSelectedEvent(event);
      }
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const { width, height } = dimensions;
    const headerHeight = 30;
    const hourHeight = (height - headerHeight) / 13;
    const timeLabelWidth = 50;
    const dayWidth = (width - timeLabelWidth) / 5;

    canvas.width = width;
    canvas.height = height;

    context.clearRect(0, 0, width, height);
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    context.fillStyle = "#f0f0f0";
    context.fillRect(timeLabelWidth, 0, width - timeLabelWidth, headerHeight);

    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].forEach(
      (day, index) => {
        context.fillStyle = "#000";
        context.font = "14px Arial";
        context.fillText(
          day,
          timeLabelWidth +
            dayWidth * index +
            dayWidth / 2 -
            context.measureText(day).width / 2,
          20
        );
      }
    );

    context.beginPath();
    context.moveTo(timeLabelWidth, 0);
    context.lineTo(timeLabelWidth, height);
    for (let i = 0; i < 5; i++) {
      context.moveTo(timeLabelWidth + dayWidth * (i + 1), headerHeight);
      context.lineTo(timeLabelWidth + dayWidth * (i + 1), height);
    }
    for (let i = 0; i <= 13; i++) {
      context.moveTo(timeLabelWidth, headerHeight + i * hourHeight);
      context.lineTo(width, headerHeight + i * hourHeight);
    }
    context.strokeStyle = "#ccc";
    context.stroke();

    for (let i = 0; i <= 13; i++) {
      context.fillStyle = "#000";
      context.fillText(`${7 + i}:00`, 5, headerHeight + i * hourHeight + 5);
    }

    events.forEach((event) => {
      const dayIndex = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ].indexOf(dayMap[event.day]);
      if (dayIndex === -1) return; // skip if day is not a weekday
      const startX = timeLabelWidth + dayWidth * dayIndex;
      const startY =
        headerHeight + timeToYPosition(event.startTime, 7, hourHeight);
      const endY = headerHeight + timeToYPosition(event.endTime, 7, hourHeight);

      context.fillStyle = event.color;
      context.fillRect(startX, startY, dayWidth, endY - startY);
      context.strokeStyle = "black";
      context.strokeRect(startX, startY, dayWidth, endY - startY);

      context.fillStyle = "black";
      context.font = "12px Arial";
      context.fillText(event.title, startX + 5, startY + 20, dayWidth - 10);
    });
  }, [dimensions, events]);

  return (
    <div
      ref={containerRef}
      className="calendar-container w-full"
      onClick={handleCanvasClick}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
      />
      {selectedEvent && (
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "white",
            border: "1px solid black",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <p>
            <strong>{selectedEvent.title}</strong>
          </p>
          <p>
            Time: {selectedEvent.startTime} - {selectedEvent.endTime}
          </p>
          <p>Details: {selectedEvent.details}</p>
          <button onClick={() => setSelectedEvent(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Calendar;
