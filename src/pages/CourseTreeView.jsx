import React, { useState, useEffect, useRef } from "react";
import TreeView from "../components/TreeView";
import ActionButton from "../components/ActionButton";

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
  const extraInfoRef = useRef([]);

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
