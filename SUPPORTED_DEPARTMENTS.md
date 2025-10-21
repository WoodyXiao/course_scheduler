# Supported Departments

## Overview
The Course Prerequisite Tree Viewer now supports multiple departments across SFU. Each department has its own color scheme for better visual distinction.

## Currently Supported Departments

### 1. **CMPT - Computing Science**
- **Color**: Sky Blue (`#0284C7` → `#0EA5E9`)
- **Data Files**:
  - `sfu_cmpt_2025_spring.json`
  - `sfu_cmpt_2025_summer.json`
  - `sfu_cmpt_2025_fall.json`
- **Example Courses**: CMPT 120, CMPT 225, CMPT 354

### 2. **MATH - Mathematics**
- **Color**: Orange (`#F97316` → `#FB923C`)
- **Data Files**:
  - `sfu_math_2025_fall.json`
- **Example Courses**: MATH 100, MATH 152, MATH 232
- **Note**: Unified color scheme with MACM (Applied Mathematics)

### 3. **BPK - Biomedical Physiology and Kinesiology**
- **Color**: Emerald Green (`#059669` → `#10B981`)
- **Data Files**:
  - `sfu_bpk_2025_summer.json`
  - `sfu_bpk_2025_fall.json`
- **Example Courses**: BPK 201, BPK 205

### 4. **BUS - Business**
- **Color**: Pink (`#DB2777` → `#EC4899`)
- **Data Files**:
  - `sfu_bus_2025_summer.json`
  - `sfu_bus_2025_fall.json`
- **Example Courses**: BUS 201, BUS 312

### 5. **ENSC - Engineering Science**
- **Color**: Indigo/Purple (`#4F46E5` → `#7C3AED`)
- **Data Files**:
  - `sfu_ensc_2025_summer.json`
  - `sfu_ensc_2025_fall.json`
- **Example Courses**: ENSC 100, ENSC 251

## Additional Pre-configured Departments
These departments are configured in the color system but don't have data files yet:

- **MACM** - Applied Mathematics (Orange, unified with MATH)
- **STAT** - Statistics (Cyan)
- **PHYS** - Physics (Amber/Yellow)
- **CHEM** - Chemistry (Deep Orange)
- **BIOL** - Biology (Teal)
- **ECON** - Economics (Yellow)
- **PSYC** - Psychology (Purple/Violet)
- **ENGL** - English (Cyan)
- **HIST** - History (Brown)
- **PHIL** - Philosophy (Indigo)

## How to Add a New Department

### 1. Add Data Files
Place JSON files in the appropriate directory:
```
src/assets/sfu_courses_2025/[department_code]/
  - sfu_[department_code]_2025_spring.json (optional)
  - sfu_[department_code]_2025_summer.json (optional)
  - sfu_[department_code]_2025_fall.json (optional)
```

### 2. Update Course Loading
Edit `src/pages/CourseTreeview.jsx`:
```javascript
Promise.all([
  // ... existing imports
  import("../assets/sfu_courses_2025/[dept]/sfu_[dept]_2025_fall.json"),
])
```

### 3. Add Color Configuration
Edit `src/components/TreeView.jsx`:
```javascript
const departmentColors = {
  // ... existing colors
  'DEPT': { from: '#XXXXXX', to: '#YYYYYY', name: 'Department Name' },
};
```

**Important**: Avoid using red (reserved for AND nodes) and green (reserved for OR nodes).

### 4. Update UI
Edit `src/pages/CourseTreeview.jsx` to add the new department to the supported list:
```javascript
<p className="text-xs sm:text-sm text-gray-500 mt-1">
  Supports: ... <span className="font-semibold text-[color]">[DEPT]</span>
</p>
```

## Features

### AI-Enhanced Parsing
All departments benefit from the AI-enhanced prerequisite parsing system using Google Gemini API, which provides:
- Better accuracy for complex prerequisite structures
- Support for non-standard prerequisite formats
- Handling of high school courses (e.g., "BC Math 12")
- Intelligent fallback to local parser if AI is unavailable

### Caching System
To reduce AI API calls and improve performance:
- Previously parsed courses are cached
- Cache persists during the session
- "Clear Cache" button available to reset

### Search Functionality
- Auto-suggestions while typing
- Keyboard navigation (↑↓, Enter, Esc)
- Supports all loaded departments

### Plan Mode
- Visualize prerequisite paths
- Check off completed courses
- Validate prerequisite satisfaction
- Disabled expand/collapse during planning

## Data File Format

Each JSON file should follow this structure:
```json
[
  {
    "subject": "CMPT",
    "course_number": "225",
    "name": "Data Structures and Programming",
    "prerequisites": "CMPT 125 or CMPT 126, and MATH 152",
    "term": "2025 Fall"
  }
]
```

### Required Fields
- `subject` or `department`: Department code (e.g., "CMPT")
- `course_number`: Course number (e.g., "225")
- `prerequisites`: Prerequisite string (can be empty)

### Optional Fields
- `name`: Course title
- `term`: Academic term
- Any other metadata

## Performance Considerations

### Current Load
- Total departments: 5 active (CMPT, MATH, BPK, BUS, ENSC)
- Total data files: 10
- Estimated courses: ~1000+

### Optimization Strategies
- Lazy loading of prerequisite trees (only loads when expanded)
- AI caching to reduce API calls
- Efficient deduplication of courses across terms

## Future Enhancements

### Potential Additions
1. **More Departments**: STAT, PHYS, CHEM, BIOL, ECON, etc.
2. **More Terms**: Add Spring terms for all departments
3. **Search Filters**: Filter by term, department, level
4. **Export Features**: Export prerequisite paths as PDF/image
5. **Course Comparison**: Compare prerequisites across similar courses

### Data Updates
- Add a data versioning system
- Implement automatic data refresh
- Add data source attribution

## Contributing

To add data for a new department:
1. Collect course data in JSON format
2. Follow the directory structure
3. Add color configuration
4. Update the course loading logic
5. Test thoroughly with the TreeView
6. Update this documentation

## License & Data Source

Course data is sourced from SFU's official course catalog. Please ensure compliance with SFU's data usage policies when adding new data.

---

**Last Updated**: 2025-01-20
**Version**: 2.0
**Maintainer**: Course Scheduler Team

