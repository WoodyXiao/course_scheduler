import React from "react";
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
                                  name:"AND",
                                  condition:"AND",
                                  children:[{
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
                                  },]
                                }
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
                                                  name:"AND",
                                                  condition:"AND",
                                                  children:[{
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
                                                  },]
                                                }
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
                                  name:"AND",
                                  condition:"AND",
                                  children:[{
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
                                  },]
                                }
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
      prerequisites: "(MACM 101 and (CMPT 125 and (CMPT 129 or CMPT 135))) or (ENSC 251 and ENSC 252)",
  },
};

function parsePrerequisites(prerequisites) {
  let index = 0;
  const tokens = prerequisites.match(/\(|\)|\w+ \d+|and|or/gi);

  function parseExpression() {
      let exprStack = [];
      let current = { name: "ROOT", condition: "", children: [] };

      while (index < tokens.length) {
          let token = tokens[index].toUpperCase();
          index++;

          if (token === '(') {
              // Start of a new sub-expression
              exprStack.push(current);
              current = { name: "ROOT", condition: "", children: [] };
          } else if (token === 'AND' || token === 'OR') {
              if (current.name === "ROOT") {
                  // Assign current node's name and condition if empty
                  current.name = token;
                  current.condition = token;
              } else {
                  // Different operations start or condition nesting is required
                  let newNode = { name: token, condition: token, children: [] };
                  if (current.condition !== token) {
                      exprStack.push(current);
                      current = newNode;
                  } else {
                      // Continue collecting children for the same condition
                      if (current.children.length > 0 && current.children[current.children.length - 1].condition !== "") {
                          exprStack.push(current);
                          current = newNode;
                      }
                  }
              }
          } else if (token === ')') {
              // End of a sub-expression
              let completed = current;
              current = exprStack.pop();
              current.children.push(completed);
          } else if (/\w+ \d+/.test(token)) {
              // It's a course, simply add it
              current.children.push({
                  name: token,
                  condition: "",
                  children: []
              });
          }
      }

      return current.children.length === 1 ? current.children[0] : current;
  }

  const root = {
      name: "CMPT 225",
      condition: "",
      children: [parseExpression()]
  };

  return root;
}

const CourseTreeView = () => {
  console.log(JSON.stringify(parsePrerequisites(cmpt225.info.prerequisites), null, 2))

  return (
    <div className="flex-grow mt-8 p-4 max-w-screen-xl mx-auto w-full">
      <h1 className="text-3xl font-bold">Course Requirements Quick Check</h1>
      <div className="flex-auto">
        <h3 className="font-bold">Course Search</h3>
        <input
          className="appearance bg-transparent border text-gray-700 mr-3 py-1 px-2 leading-tight rounded"
          placeholder="Enter your course"
          value={""}
        />
        <ActionButton text={"Search"} />
      </div>
      <TreeView data={treeData} />
    </div>
  );
};

export default CourseTreeView;
