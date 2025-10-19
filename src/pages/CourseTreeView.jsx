import React, { useState, useEffect, useRef } from "react";
import TreeView from "../components/TreeView";

// 工具函数：兼容所有格式
function parseCourseKey(token) {
  // 兼容 "CMPT 125" / "CMPT125" / "CMPT125W" / "cmpt125"
  token = token.toUpperCase().replace(/\s+/g, "");
  const match = token.match(/^([A-Z]+)([0-9]{3,4}[A-Z]?)$/);
  if (!match) return [null, null];
  return [match[1], match[2]];
}

const CourseTreeView = () => {
  const [courseData, setCourseData] = useState(null);
  const [courseNumber, setCourseNumber] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [extraInfo, setExtraInfo] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); // Track if user has searched
  const [suggestions, setSuggestions] = useState([]); // Auto-suggestions
  const [showSuggestions, setShowSuggestions] = useState(false); // Show/hide suggestions
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1); // Keyboard navigation
  const extraInfoRef = useRef([]);
  const suggestionsRef = useRef(null); // Ref for suggestions dropdown

  // 1. Load and normalize all cmpt courses, take name from subject
  useEffect(() => {
    Promise.all([
      import("../assets/sfu_courses_2025/cmpt/sfu_cmpt_2025_spring.json"),
      import("../assets/sfu_courses_2025/cmpt/sfu_cmpt_2025_summer.json"),
      import("../assets/sfu_courses_2025/cmpt/sfu_cmpt_2025_fall.json"),
      // import("../assets/sfu_courses_2025/math/sfu_math_2025_fall.json"),
    ])
      .then(([spring, summer, fall, math]) => {
        // 合并所有term
        const merged = [
          ...(spring.default || []),
          ...(summer.default || []),
          ...(fall.default || []),
          // ...(math.default || []),
        ];

        // 标准化，自动抽subject
        const normalized = merged.map((item) => {
          let subject =
            item.subject ||
            item.department ||
            item.code ||
            item.subject_area ||
            "";
          if (!subject && item.name) {
            const match = item.name.match(/^([A-Z]+)\s/);
            if (match) subject = match[1];
          }
          return {
            ...item,
            course_number: String(item.course_number).toUpperCase(),
            subject: String(subject).toUpperCase(),
          };
        });

        // 用 Map 去重，只保留每个 subject+course_number 的最新一项
        const dedupedMap = new Map();
        for (const course of normalized) {
          // 以"CMPT 225"为key，后面遇到的会覆盖前面，或者你喜欢只保留第一次出现的可以加 if (!dedupedMap.has(key))
          const key = `${course.subject} ${course.course_number}`;
          dedupedMap.set(key, course);
        }
        const deduped = Array.from(dedupedMap.values());

        console.log("去重后的allCourses示例:", deduped[0]);
        setAllCourses(deduped);
      })
      .catch((error) => console.error("Failed to load course data", error));
  }, []);
  console.log("allCourses:", allCourses);
  // 2. Search and recursive
  useEffect(() => {
    if (courseNumber && allCourses.length > 0) {
      setHasSearched(true); // Mark that a search has been performed
      setCourseData(null);
      extraInfoRef.current = [];

      // 拆分兼容格式，始终规范成 "CMPT 125"
      const [subject, num] = parseCourseKey(courseNumber);
      const inputNum =
        subject && num
          ? `${subject} ${num}`
          : courseNumber.toUpperCase().trim();

      const course = allCourses.find(
        (c) => `${c.subject} ${c.course_number}` === inputNum
      );
      console.log(
        "[Search] Input course number",
        inputNum,
        " | Searched Courses:",
        course
      );

      if (course && course.prerequisites) {
        const parsedData = parsePrerequisites(
          course.prerequisites,
          allCourses,
          new Set(),
          `${course.subject} ${course.course_number}`
        );
        setCourseData(parsedData);
        setExtraInfo([...extraInfoRef.current]);
      } else {
        setCourseData(null);
        setExtraInfo([]);
      }
    }
  }, [courseNumber, allCourses]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSuggestions]);

  // 3. Recursive.
  function parsePrerequisites(
    prerequisites,
    allCourses,
    visited = new Set(),
    courseFullName = ""
  ) {
    let removedDescriptions = [];
    prerequisites = prerequisites.replace(
      /(for students in an Applied Physics program|both with a minimum grade of [A-Z-]| all with a minimum grade of [A-Z-]+\.)|(\s+with a minimum grade of C-)|(\s*MATH \d{3} or MATH \d{3} with (at least a|a grade of at least) B\+ may be substituted for MATH \d{3}( or MATH \d{3})?( \([^)]*\))?|\s*CMPT \d{3} and \d{3} are recommended|\s*are recommended)|(\s*at least \d+ units)|(\s*CGPA and UDGPA over \d+\.\d+)|(\s*enrolled in any [^,]+ program)|(\s*Participation in the [^,]+ is competitive and an application must be submitted to the [^,]+ by a defined due date announced each term)/g,
      function (match) {
        removedDescriptions.push(match.trim());
        return "";
      }
    );
    if (removedDescriptions.length > 0) {
      extraInfoRef.current.push(...removedDescriptions);
    }

    prerequisites = prerequisites.replace(
      /(\w+)\s+(\d+[A-Z]?)(\s*(?:,|and)\s*\d+[A-Z]?)+/g,
      (match, dept, firstCourse, remainingCourses) => {
        remainingCourses = remainingCourses.replace(
          /(\s*(?:,|and)\s*)(\d+[A-Z]?)/g,
          `$1${dept} $2`
        );
        return `${dept} ${firstCourse}${remainingCourses}`;
      }
    );
    prerequisites = prerequisites.trim();

    // 这里允许同时兼容有无空格格式
    const tokens =
      prerequisites.match(/\(|\)|[A-Z]+\s*[0-9]{3,4}[A-Z]?|and|or/gi) || [];
    let index = 0;

    function parseExpression() {
      let exprStack = [];
      let current = { name: "ROOT", condition: "", children: [] };
      while (index < tokens.length) {
        let token = tokens[index];
        index++;

        if (token === "(") {
          exprStack.push(current);
          current = { name: "ROOT", condition: "", children: [] };
          continue;
        }

        if (
          token &&
          (token.toUpperCase() === "AND" || token.toUpperCase() === "OR")
        ) {
          if (current.name === "ROOT") {
            current.name = token.toUpperCase();
            current.condition = token.toUpperCase();
          } else {
            let newNode = {
              name: token.toUpperCase(),
              condition: token.toUpperCase(),
              children: [],
            };
            exprStack.push(current);
            current = newNode;
          }
          continue;
        }

        if (token === ")") {
          let completed = current;
          current = exprStack.pop();
          current.children.push(completed);
          continue;
        }

        // 新增：兼容无空格和有空格格式
        if (/^[A-Z]+\s*[0-9]{3,4}[A-Z]?$/.test(token.toUpperCase())) {
          const [dept, num] = parseCourseKey(token);
          if (!dept || !num) {
            console.error(
              "illegal token: ",
              token,
              "Can't split subject and course_number"
            );
            current.children.push({ name: token, condition: "", children: [] });
            continue;
          }
          const key = `${dept} ${num}`;
          console.log(
            "[token]=",
            token,
            "| [dept]=",
            dept,
            "| [num]=",
            num,
            "| [key]=",
            key
          );
          if (!visited.has(key)) {
            visited.add(key);

            const matched = allCourses.filter(
              (c) =>
                (c.subject || "") === dept && (c.course_number || "") === num
            );
            console.log(
              "Serch course key:",
              key,
              "result:",
              matched.length,
              matched
            );

            const found = matched[0];
            let childNode = { name: key, condition: "", children: [] };
            if (found && found.prerequisites && found.prerequisites.trim()) {
              console.log(
                "Recursively search: ",
                key,
                "pre:",
                found.prerequisites
              );
              const subTree = parsePrerequisites(
                found.prerequisites,
                allCourses,
                new Set(visited),
                key
              );
              if (subTree && subTree.children && subTree.children.length > 0) {
                childNode.children = subTree.children;
                childNode.condition = subTree.condition || "";
              }
            }
            current.children.push(childNode);
          } else {
            current.children.push({ name: key, condition: "", children: [] });
          }
          continue;
        }

        console.warn("This is unknown token:", token);
        current.children.push({
          name: String(token),
          condition: "",
          children: [],
        });
      }
      return current.children.length === 1 ? current.children[0] : current;
    }

    return {
      name: courseFullName || "",
      condition: "",
      children: [parseExpression()],
    };
  }

  // 搜索框：自动兼容格式
  const handleSearch = () => {
    const [subject, num] = parseCourseKey(inputValue.trim());
    if (subject && num) {
      setCourseNumber(`${subject} ${num}`);
    } else {
      setCourseNumber(inputValue.trim().toUpperCase());
    }
    setShowSuggestions(false); // Hide suggestions after search
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);
    
    // Generate suggestions if input is not empty
    if (value.trim().length > 0) {
      const filtered = allCourses
        .filter(course => {
          const courseCode = `${course.subject} ${course.course_number}`.toLowerCase();
          const searchTerm = value.toLowerCase().trim();
          return courseCode.includes(searchTerm);
        })
        .slice(0, 10); // Limit to 10 suggestions
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setActiveSuggestionIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const handleSuggestionClick = (course) => {
    const courseCode = `${course.subject} ${course.course_number}`;
    setInputValue(courseCode);
    setCourseNumber(courseCode);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
  };

  const handleKeyDown = (event) => {
    if (!showSuggestions) {
      if (event.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
          handleSuggestionClick(suggestions[activeSuggestionIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex-grow mt-4 sm:mt-8 p-3 sm:p-4 max-w-screen-xl mx-auto w-full">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
          Course Prerequisite Tree Viewer
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Visualize course prerequisites in an interactive tree structure
        </p>
      </div>

      {/* Search Section */}
      <div className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-200 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="font-bold text-base sm:text-lg text-gray-800">Course Search</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative" ref={suggestionsRef}>
            <input
              className="w-full px-4 py-3 text-sm sm:text-base bg-white border-2 border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm"
              type="text"
              placeholder="Enter course number (e.g., CMPT 225, CMPT 376W)"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border-2 border-blue-300 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                {suggestions.map((course, index) => {
                  const courseCode = `${course.subject} ${course.course_number}`;
                  const hasPrerequisites = course.prerequisites && course.prerequisites.trim().length > 0;
                  const isActive = index === activeSuggestionIndex;
                  
                  return (
                    <div
                      key={`${course.subject}-${course.course_number}-${index}`}
                      className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                        isActive 
                          ? 'bg-blue-100 border-l-4 border-l-blue-600' 
                          : 'hover:bg-blue-50 border-l-4 border-l-transparent'
                      }`}
                      onClick={() => handleSuggestionClick(course)}
                      onMouseEnter={() => setActiveSuggestionIndex(index)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm sm:text-base font-semibold ${
                              isActive ? 'text-blue-700' : 'text-gray-800'
                            }`}>
                              {courseCode}
                            </p>
                            {hasPrerequisites ? (
                              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                Has Prerequisites
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                No Prerequisites
                              </span>
                            )}
                          </div>
                        </div>
                        {isActive && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <p className="mt-2 text-xs sm:text-sm text-gray-600 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {showSuggestions ? 'Use ↑↓ to navigate, Enter to select, Esc to close' : 'Start typing to see suggestions'}
            </p>
          </div>
          <button
            onClick={handleSearch}
            className="px-6 h-[52px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 touch-manipulation whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Results Section */}
      {courseData ? (
        <TreeView data={courseData} />
      ) : hasSearched ? (
        // No results found after search
        <div className="text-sm sm:text-base text-gray-600 p-6 sm:p-8 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-dashed border-red-300 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-lg font-semibold text-red-700 mb-2">No Results Found</p>
          <p className="text-red-600 mb-3">
            Course "<span className="font-semibold">{courseNumber}</span>" was not found or has no prerequisites.
          </p>
          <p className="text-sm text-gray-600">
            Please check the course number and try again, or try a different course.
          </p>
        </div>
      ) : (
        // Initial state - no search performed yet
        <div className="text-sm sm:text-base text-gray-600 p-6 sm:p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-lg font-semibold text-gray-700 mb-2">Ready to Explore</p>
          <p className="text-gray-500">Enter a course number above to view its prerequisite tree</p>
        </div>
      )}

      {/* Extra Info Section */}
      {courseData && extraInfo.length > 0 && (
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-amber-50 rounded-xl border border-amber-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="font-bold text-base sm:text-lg text-amber-900">
              Additional Notes for {courseData.name}
            </h2>
          </div>
          <ul className="space-y-2 text-sm sm:text-base">
            {extraInfo.map((text, index) => (
              <li key={index} className="text-amber-800 pl-2 flex gap-2">
                <span className="font-semibold text-amber-900">{index + 1}.</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CourseTreeView;
