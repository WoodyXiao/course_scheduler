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
                          name: "AND",
                          condition: "AND",
                          children: [
                            {
                              name: "MACM 101",
                            },
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
                                          name: "AND",
                                          condition: "AND",
                                          children: [
                                            {
                                              name: "MACM 101",
                                            },
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
                          name: "AND",
                          condition: "AND",
                          children: [
                            {
                              name: "MACM 101",
                            },
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

// const cmpt225mock = {
//   info: {
//     prerequisites:
//       "(MACM 101 and (CMPT 125, CMPT 129 or CMPT 135)) or (ENSC 251 and ENSC 252), all with a minimum grade of C-.",
//   },
// };

const CourseTreeView = () => {
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
