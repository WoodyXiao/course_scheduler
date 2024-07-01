import React, { useState, useEffect } from "react";
import TreeView from "../components/TreeView";
import ActionButton from "../components/ActionButton";

const treeData = {
  name: "Course",
  children: [
    {
      name: "CMPT 471",
      children: [
        {
          name: "AND",
          condition: "AND",
          children: [
            {
              name: "CMPT 300",
              children: [
                {
                  name: "AND",
                  condition: "AND",
                  children: [
                    {
                      name: "CMPT 225",
                      children: [
                        {
                          name: "OR",
                          condition: "OR",
                          children: [
                            {
                              name: "AND",
                              condition: "AND",
                              children: [
                                {
                                  name: "MACM 101",
                                },
                                {
                                  name: "AND",
                                  condition: "AND",
                                  children: [
                                    {
                                      name: "CMPT 125",
                                      children: [
                                        {
                                          name: "OR",
                                          condition: "OR",
                                          children: [
                                            {
                                              name: "CMPT 120",
                                            },
                                            {
                                              name: "CMPT 130",
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                    {
                                      name: "OR",
                                      condition: "OR",
                                      children: [
                                        { name: "CMPT 129" },
                                        {
                                          name: "CMPT 135",
                                          children: [
                                            {
                                              name: "CMPT 130",
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              name: "AND",
                              condition: "AND",
                              children: [
                                {
                                  name: "ENSC 251",
                                  children: [
                                    {
                                      name: "OR",
                                      condition: "OR",
                                      children: [
                                        {
                                          name: "ENSC 151",
                                        },
                                        {
                                          name: "CMPT 135",
                                          children: [
                                            {
                                              name: "CMPT 130",
                                            },
                                          ],
                                        },
                                        {
                                          name: "AND",
                                          condition: "AND",
                                          children: [
                                            {
                                              name: "CMPT 125",
                                              children: [
                                                {
                                                  name: "OR",
                                                  condition: "OR",
                                                  children: [
                                                    {
                                                      name: "CMPT 120",
                                                    },
                                                    {
                                                      name: "CMPT 130",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                            {
                                              name: "CMPT 127",
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "ENSC 252",
                                  children: [
                                    {
                                      name: "OR",
                                      condition: "OR",
                                      children: [
                                        { name: "ENSC 151" },
                                        {
                                          name: "CMPT 125",
                                          children: [
                                            {
                                              name: "OR",
                                              condition: "OR",
                                              children: [
                                                {
                                                  name: "CMPT 120",
                                                },
                                                {
                                                  name: "CMPT 130",
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                        { name: "CMPT 126" },
                                        {
                                          name: "CMPT 135",
                                          children: [
                                            {
                                              name: "CMPT 130",
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      name: "OR",
                      condition: "OR",
                      children: [
                        {
                          name: "CMPT 295",
                          children: [
                            {
                              name: "OR",
                              condition: "OR",
                              children: [
                                {
                                  name: "AND",
                                  condition: "AND",
                                  children: [
                                    { name: "MACM 101" },
                                    {
                                      name: "OR",
                                      condition: "OR",
                                      children: [
                                        {
                                          name: "CMPT 125",
                                          children: [
                                            {
                                              name: "OR",
                                              condition: "OR",
                                              children: [
                                                {
                                                  name: "CMPT 120",
                                                },
                                                {
                                                  name: "CMPT 130",
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                        {
                                          name: "CMPT 135",
                                          children: [{ name: "CMPT 130" }],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "AND",
                                  condition: "AND",
                                  children: [
                                    { name: "MATH 151" },
                                    { name: "CMPT 102" },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                        {
                          name: "ENSC 254",
                          children: [
                            {
                              name: "OR",
                              condition: "OR",
                              children: [
                                {
                                  name: "AND",
                                  condition: "AND",
                                  children: [
                                    {
                                      name: "ENSC 251",
                                      children: [
                                        {
                                          name: "OR",
                                          condition: "OR",
                                          children: [
                                            {
                                              name: "ENSC 151",
                                            },
                                            {
                                              name: "CMPT 135",
                                              children: [
                                                {
                                                  name: "CMPT 130",
                                                },
                                              ],
                                            },
                                            {
                                              name: "AND",
                                              condition: "AND",
                                              children: [
                                                {
                                                  name: "CMPT 125",
                                                  children: [
                                                    {
                                                      name: "OR",
                                                      condition: "OR",
                                                      children: [
                                                        {
                                                          name: "CMPT 120",
                                                        },
                                                        {
                                                          name: "CMPT 130",
                                                        },
                                                      ],
                                                    },
                                                  ],
                                                },
                                                {
                                                  name: "CMPT 127",
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                    {
                                      name: "ENSC 252",
                                      children: [
                                        {
                                          name: "OR",
                                          condition: "OR",
                                          children: [
                                            { name: "ENSC 151" },
                                            {
                                              name: "CMPT 125",
                                              children: [
                                                {
                                                  name: "OR",
                                                  condition: "OR",
                                                  children: [
                                                    {
                                                      name: "CMPT 120",
                                                    },
                                                    {
                                                      name: "CMPT 130",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                            { name: "CMPT 126" },
                                            {
                                              name: "CMPT 135",
                                              children: [
                                                {
                                                  name: "CMPT 130",
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "AND",
                                  condition: "NAD",
                                  children: [
                                    {
                                      name: "CMPT 225",
                                      children: [
                                        {
                                          name: "OR",
                                          condition: "OR",
                                          children: [
                                            {
                                              name: "AND",
                                              condition: "AND",
                                              children: [
                                                {
                                                  name: "MACM 101",
                                                },
                                                {
                                                  name: "AND",
                                                  condition: "AND",
                                                  children: [
                                                    {
                                                      name: "CMPT 125",
                                                      children: [
                                                        {
                                                          name: "OR",
                                                          condition: "OR",
                                                          children: [
                                                            {
                                                              name: "CMPT 120",
                                                            },
                                                            {
                                                              name: "CMPT 130",
                                                            },
                                                          ],
                                                        },
                                                      ],
                                                    },
                                                    {
                                                      name: "OR",
                                                      condition: "OR",
                                                      children: [
                                                        { name: "CMPT 129" },
                                                        {
                                                          name: "CMPT 135",
                                                          children: [
                                                            {
                                                              name: "CMPT 130",
                                                            },
                                                          ],
                                                        },
                                                      ],
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                            {
                                              name: "AND",
                                              condition: "AND",
                                              children: [
                                                {
                                                  name: "ENSC 251",
                                                  children: [
                                                    {
                                                      name: "OR",
                                                      condition: "OR",
                                                      children: [
                                                        {
                                                          name: "ENSC 151",
                                                        },
                                                        {
                                                          name: "CMPT 135",
                                                          children: [
                                                            {
                                                              name: "CMPT 130",
                                                            },
                                                          ],
                                                        },
                                                        {
                                                          name: "AND",
                                                          condition: "AND",
                                                          children: [
                                                            {
                                                              name: "CMPT 125",
                                                              children: [
                                                                {
                                                                  name: "OR",
                                                                  condition:
                                                                    "OR",
                                                                  children: [
                                                                    {
                                                                      name: "CMPT 120",
                                                                    },
                                                                    {
                                                                      name: "CMPT 130",
                                                                    },
                                                                  ],
                                                                },
                                                              ],
                                                            },
                                                            {
                                                              name: "CMPT 127",
                                                            },
                                                          ],
                                                        },
                                                      ],
                                                    },
                                                  ],
                                                },
                                                {
                                                  name: "ENSC 252",
                                                  children: [
                                                    {
                                                      name: "OR",
                                                      condition: "OR",
                                                      children: [
                                                        { name: "ENSC 151" },
                                                        {
                                                          name: "CMPT 125",
                                                          children: [
                                                            {
                                                              name: "OR",
                                                              condition: "OR",
                                                              children: [
                                                                {
                                                                  name: "CMPT 120",
                                                                },
                                                                {
                                                                  name: "CMPT 130",
                                                                },
                                                              ],
                                                            },
                                                          ],
                                                        },
                                                        { name: "CMPT 126" },
                                                        {
                                                          name: "CMPT 135",
                                                          children: [
                                                            {
                                                              name: "CMPT 130",
                                                            },
                                                          ],
                                                        },
                                                      ],
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                    {
                                      name: "CMPT 150",
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },

            {
              name: "CMPT 371",
              children: [
                {
                  name: "AND",
                  condition: "AND",
                  children: [
                    {
                      name: "CMPT 225",
                      children: [
                        {
                          name: "OR",
                          condition: "OR",
                          children: [
                            {
                              name: "AND",
                              condition: "AND",
                              children: [
                                {
                                  name: "MACM 101",
                                },
                                {
                                  name: "AND",
                                  condition: "AND",
                                  children: [
                                    {
                                      name: "CMPT 125",
                                      children: [
                                        {
                                          name: "OR",
                                          condition: "OR",
                                          children: [
                                            {
                                              name: "CMPT 120",
                                            },
                                            {
                                              name: "CMPT 130",
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                    {
                                      name: "OR",
                                      condition: "OR",
                                      children: [
                                        { name: "CMPT 129" },
                                        {
                                          name: "CMPT 135",
                                          children: [
                                            {
                                              name: "CMPT 130",
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              name: "AND",
                              condition: "AND",
                              children: [
                                {
                                  name: "ENSC 251",
                                  children: [
                                    {
                                      name: "OR",
                                      condition: "OR",
                                      children: [
                                        {
                                          name: "ENSC 151",
                                        },
                                        {
                                          name: "CMPT 135",
                                          children: [
                                            {
                                              name: "CMPT 130",
                                            },
                                          ],
                                        },
                                        {
                                          name: "AND",
                                          condition: "AND",
                                          children: [
                                            {
                                              name: "CMPT 125",
                                              children: [
                                                {
                                                  name: "OR",
                                                  condition: "OR",
                                                  children: [
                                                    {
                                                      name: "CMPT 120",
                                                    },
                                                    {
                                                      name: "CMPT 130",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                            {
                                              name: "CMPT 127",
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "ENSC 252",
                                  children: [
                                    {
                                      name: "OR",
                                      condition: "OR",
                                      children: [
                                        { name: "ENSC 151" },
                                        {
                                          name: "CMPT 125",
                                          children: [
                                            {
                                              name: "OR",
                                              condition: "OR",
                                              children: [
                                                {
                                                  name: "CMPT 120",
                                                },
                                                {
                                                  name: "CMPT 130",
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                        { name: "CMPT 126" },
                                        {
                                          name: "CMPT 135",
                                          children: [
                                            {
                                              name: "CMPT 130",
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      name: "OR",
                      condition: "OR",
                      children: [{ name: "MATH 151" }, { name: "MATH 150" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// Test the parse pre
const cmpt225 = {
  info: {
    prerequisites:
      "One W course and (CMPT 225 and (MACM 101 or (ENSC 251 and ENSC 252)) and (MATH 151 or MATH 150))",
  },
};

const CourseTreeView = () => {
  const [courseData, setCourseData] = useState(null);
  const [courseNumber, setCourseNumber] = useState("");
  const [inputValue, setInputValue] = useState("");

  function parsePrerequisites(prerequisites) {
    console.log("before remove des: ", prerequisites);

    // Removing specific program descriptions and general cleanup
    prerequisites = prerequisites.replace(
      /(for students in an Applied Physics program|Either|, all with a minimum grade of [A-Z-]+\.)|(\s+MATH 154 or MATH 157 with (at least a|a grade of at least) B\+ may be substituted for MATH 15[01] or MATH 15[01])/g,
      ""
    );

    console.log("before 'comma' convert to 'and': ", prerequisites);

    // Only replace commas with 'and' and adjust parentheses when necessary
    prerequisites = prerequisites.replace(
      /\(([^)]+)\)/g,
      function (match, group) {
        if (group.includes(",")) {
          // Check if the group actually needs modification
          let parts = group.split(",").map((part) => part.trim());
          return (
            "(" +
            parts
              .map((part) => {
                // Nested condition handling for 'or'
                if (part.includes("or")) {
                  let subParts = part
                    .split("or")
                    .map((subPart) => subPart.trim());
                  return "(" + subParts.join(" or ") + ")";
                }
                return part;
              })
              .join(" and ") +
            ")"
          );
        }
        return match; // Return the original match if no commas
      }
    );

    console.log("after 'comma' convert to 'and': ", prerequisites);

    prerequisites = prerequisites.trim();

    console.log("after trim: ", prerequisites);

    // Tokenization to capture relevant terms and structures
    const tokens = prerequisites.match(/\(|\)|\w+ \d+|and|or/gi);
    console.log("Processed prerequisites for tokens:", prerequisites);

    let index = 0;
    function parseExpression() {
      let exprStack = [];
      let current = { name: "ROOT", condition: "", children: [] };

      while (index < tokens.length) {
        let token = tokens[index].toUpperCase();
        index++;

        if (token === "(") {
          exprStack.push(current);
          current = { name: "ROOT", condition: "", children: [] };
        } else if (token === "AND" || token === "OR") {
          if (current.name === "ROOT") {
            current.name = token;
            current.condition = token;
          } else {
            let newNode = { name: token, condition: token, children: [] };
            exprStack.push(current);
            current = newNode;
          }
        } else if (token === ")") {
          let completed = current;
          current = exprStack.pop();
          current.children.push(completed);
        } else if (/\w+ \d+/.test(token)) {
          current.children.push({ name: token, condition: "", children: [] });
        }
      }

      return current.children.length === 1 ? current.children[0] : current;
    }

    return {
      name: "CMPT 225",
      condition: "",
      children: [parseExpression()],
    };
  }

  useEffect(() => {
    if (courseNumber) {
      // Reset course data to ensure UI reflects the loading state
      setCourseData(null);
      console.log("xxx");

      // Dynamically import the JSON data from the local file
      import("../assets/sfu_courses_2024/cmpt/sfu_cmpt_2024_summer.json")
        .then((data) => {
          // Find the course in the loaded data
          const course = data.default.find(
            (course) => course.course_number === courseNumber
          );
          if (course) {
            const parsedData = parsePrerequisites(course.prerequisites);
            setCourseData(parsedData);
          } else {
            setCourseData(null);
          }
        })
        .catch((error) => console.error("Failed to load course data", error));
    }
  }, [courseNumber]); // Depend on courseNumber to refetch when it changes

  const handleSearch = () => {
    setCourseNumber(inputValue.trim());
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  console.log("xxxx", courseData);

  return (
    <div className="flex-grow mt-8 p-4 max-w-screen-xl mx-auto w-full">
      <h1 className="text-3xl font-bold">Course Requirements Quick Check</h1>
      <div className="flex-auto">
        <h3 className="font-bold">Course Search</h3>
        cmpt
        <input
          className="appearance-none bg-transparent border border-gray-500 text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none rounded"
          type="text"
          placeholder="Enter your course number"
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
    </div>
  );
};

export default CourseTreeView;
