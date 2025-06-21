const output = {
  name: "CMPT 225",
  condition: "",
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
              condition: "",
              children: [],
            },
            {
              name: "AND",
              condition: "AND",
              children: [
                {
                  name: "CMPT 125",
                  condition: "",
                  children: [],
                },
                {
                  name: "AND",
                  condition: "AND",
                  children: [
                    {
                      name: "OR",
                      condition: "OR",
                      children: [
                        { name: "CMPT 129", condition: "", children: [] },
                        {
                          name: "CMPT 135",
                          condition: "",
                          children: [],
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
              condition: "",
              children: [],
            },
            {
              name: "ENSC 252",
              condition: "",
              children: [],
            },
          ],
        },
      ],
    },
  ],
};


//backup
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

// 
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