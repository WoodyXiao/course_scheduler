# Course Scheduler for SFU Students

## Introduction

This React application is designed to assist SFU students in selecting and prioritizing courses for their academic schedule. It provides a user-friendly interface to search for courses, view details, and assign a priority level to each. The data is sourced from SFU's RESTful API, ensuring up-to-date and accurate course information. The ultimate goal is to create an optimized schedule for students, considering their preferences and eliminating time conflicts.

## Current Features

- **Course Search:** Users can search for courses by entering the course code. The search results display detailed information about each course, including lectures and labs.
- **Priority Assignment:** For each course, users can assign a priority level (0-10) to indicate their interest.
- **Course Selection:** Users can select courses for consideration in their schedule. The selected courses are displayed in a list with their assigned priorities.
- **Remove Selected Course:** Each selected course can be removed from the list if the user changes their mind.
- **Responsive UI:** The application has a simple and responsive user interface, making it easy to navigate and use on various devices.

### Customized Scheduler Algorithm

This feature introduces a sophisticated approach to scheduling by implementing a customized scheduler algorithm. The algorithm meticulously considers the user-assigned priorities for each selected course and works to generate an optimized academic schedule. It achieves this by evaluating potential time overlaps and respecting the set priorities to construct a conflict-free and priority-optimized schedule. This tailored algorithm is especially designed to navigate the complexities of course scheduling, ensuring that students can efficiently plan their academic terms without the hassle of manual conflict resolution.

## Data Flow

1. **Course Search:** The user inputs a course code, which triggers an API call to fetch course details.
2. **Display Results:** The fetched data is displayed, allowing the user to view course details, including lectures and labs.
3. **Set Priority:** For each course, the user can set a priority using a slider component.
4. **Select Course:** The user selects courses for their schedule. The selection includes the course details and the assigned priority.
5. **Selected Courses List:** The application displays a list of selected courses with their priorities. Users can remove courses from this list.
6. **Error Handling:** In case of errors (like network issues or no data found), the application displays appropriate feedback messages.

## Future Plans (To-Do)

- **Customized Scheduler Algorithm:** Future development will focus on refining and enhancing the customized scheduler algorithm. The aim is to introduce a more advanced version that incorporates dynamic programming or other optimization techniques to improve efficiency and scalability. This update will ensure that the scheduler can handle a larger dataset of courses and constraints, providing an even more seamless and user-friendly scheduling experience for SFU students.
