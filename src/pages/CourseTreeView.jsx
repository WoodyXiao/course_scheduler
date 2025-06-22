import React, { useState, useEffect, useRef } from "react";
import TreeView from "../components/TreeView";
import ActionButton from "../components/ActionButton";

const CourseTreeView = () => {
  const [courseData, setCourseData] = useState(null);
  const [courseNumber, setCourseNumber] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [extraInfo, setExtraInfo] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const extraInfoRef = useRef([]);

  // 1. Load and normalize all cmpt courses, take name from subject
  useEffect(() => {
    import("../assets/sfu_courses_2025/cmpt/sfu_cmpt_2025_spring.json")
      .then((data) => {
        const normalized = (data.default || []).map(item => {
          // Find subject/department/code, or extract from name.
          let subject = item.subject || item.department || item.code || item.subject_area || "";
          if (!subject && item.name) {
            // Extract Course Name, e.g "CMPT" from "CMPT 225 D100"
            const match = item.name.match(/^([A-Z]+)\s/);
            if (match) subject = match[1];
          }
          return {
            ...item,
            course_number: String(item.course_number).toUpperCase(),
            subject: String(subject).toUpperCase()
          };
        });
        console.log("Standardlize allCourses example:", normalized[0]);
        setAllCourses(normalized);
      })
      .catch((error) => console.error("Failed to load course data", error));
  }, []);

  // 2. Search and recursive
  useEffect(() => {
    if (courseNumber && allCourses.length > 0) {
      setCourseData(null);
      extraInfoRef.current = [];

      const inputNum = courseNumber.toUpperCase().trim();
      const course = allCourses.find(
        (c) => (c.course_number || "") === inputNum
      );
      console.log("[Search] Input course number", inputNum, " | Searched Courses:", course);

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

    const tokens = prerequisites.match(/\(|\)|\w+ \d+[A-Z]?|and|or/gi) || [];
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

        if (token && (token.toUpperCase() === "AND" || token.toUpperCase() === "OR")) {
          if (current.name === "ROOT") {
            current.name = token.toUpperCase();
            current.condition = token.toUpperCase();
          } else {
            let newNode = { name: token.toUpperCase(), condition: token.toUpperCase(), children: [] };
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

        if (/^\w+ \d+[A-Z]?$/.test(token)) {
          const splitToken = token.split(" ");
          const dept = splitToken[0];
          const num = splitToken[1];
          if (!dept || !num) {
            console.error("illegal token: ", token, "Can't split subject and course_number");
            current.children.push({ name: token, condition: "", children: [] });
            continue;
          }
          const key = `${dept.toUpperCase()} ${num.toUpperCase()}`;
          console.log(
            "[token]=", token,
            "| [dept]=", dept,
            "| [num]=", num,
            "| [key]=", key
          );
          if (!visited.has(key)) {
            visited.add(key);

            const matched = allCourses.filter(
              (c) =>
                (c.subject || "") === dept.toUpperCase() &&
                (c.course_number || "") === num.toUpperCase()
            );
            console.log("Serch course key:", key, "result:", matched.length, matched);

            const found = matched[0];
            let childNode = { name: key, condition: "", children: [] };
            if (found && found.prerequisites && found.prerequisites.trim()) {
              console.log("Recursively search: ", key, "pre:", found.prerequisites);
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
        current.children.push({ name: String(token), condition: "", children: [] });
      }
      return current.children.length === 1 ? current.children[0] : current;
    }

    return {
      name: courseFullName || "",
      condition: "",
      children: [parseExpression()],
    };
  }

  const handleSearch = () => {
    setCourseNumber(inputValue.trim().toUpperCase());
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <div className="flex-grow mt-8 p-4 max-w-screen-xl mx-auto w-full">
      <h1 className="text-3xl font-bold">Course Requirements Quick Check</h1>
      <div className="flex-auto">
        <h3 className="font-bold">Course Search</h3>
        <input
          className="appearance-none bg-transparent border border-gray-500 text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none rounded"
          type="text"
          placeholder="Enter your course number (e.g., 225, 225W, 471)"
          value={inputValue}
          onChange={handleInputChange}
        />
        <ActionButton text={"Search"} onClick={handleSearch} />
      </div>
      {courseData ? (
        <TreeView data={courseData} />
      ) : (
        <div>No course data found. Please enter a valid course number.</div>
      )}
      {courseData && (
        <h1 className="font-bold">Extra notes ({courseData.name}):</h1>
      )}
      <ul>
        {extraInfo.map((text, index) => (
          <li key={index}>
            {index + 1}. {text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CourseTreeView;
