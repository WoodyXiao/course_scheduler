# Course Scheduler for SFU Students

## Introduction

This React application is designed to assist SFU students in selecting and prioritizing courses for their academic schedule. It provides a user-friendly interface to search for courses, view details, and assign a priority level to each. The data is sourced from SFU's RESTful API, ensuring up-to-date and accurate course information. The ultimate goal is to create an optimized schedule for students, considering their preferences and eliminating time conflicts.

## Current Features

- **Course Search:** Users can search for courses by entering the course code. The search results display detailed information about each course, including lectures and labs.
- **Priority Assignment:** For each course, users can assign a priority level (0-10) to indicate their interest.
- **Course Selection:** Users can select courses for consideration in their schedule. The selected courses are displayed in a list with their assigned priorities.
- **Remove Selected Course:** Each selected course can be removed from the list if the user changes their mind.
- **Feedback Messages:** The application provides feedback messages for actions like successful course addition, errors during course fetching, etc.
- **Responsive UI:** The application has a simple and responsive user interface, making it easy to navigate and use on various devices.

## Data Flow

1. **Course Search:** The user inputs a course code, which triggers an API call to fetch course details.
2. **Display Results:** The fetched data is displayed, allowing the user to view course details, including lectures and labs.
3. **Set Priority:** For each course, the user can set a priority using a slider component.
4. **Select Course:** The user selects courses for their schedule. The selection includes the course details and the assigned priority.
5. **Selected Courses List:** The application displays a list of selected courses with their priorities. Users can remove courses from this list.
6. **Error Handling:** In case of errors (like network issues or no data found), the application displays appropriate feedback messages.

## Future Plans (To-Do)

- **Customized Scheduler Algorithm:** Implement an algorithm to generate an optimized course schedule based on the selected courses and their assigned priorities. The algorithm will consider factors like time overlaps, course priorities, and other constraints to create the most suitable schedule for the student.
