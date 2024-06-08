import React from "react";
import TreeView from "../components/TreeView";

const treeData = {
  name: "Course",
  children: [
    {
      name: "CMPT 471",
      children: [
        {
          name: "Pre",
          condition: "AND",
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
              name: "AND",
              condition: "AND",
              children: [
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
                          name: "AND",
                          condition: "AND",
                          children: [
                            {
                              name: "OR",
                              condition: "OR",
                              children: [
                                { name: "MATH 151" },
                                { name: "MATH 150" },
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
      ],
    },
  ],
};

const CourseTreeView = () => {
  return (
    <div className="flex-grow mt-8 p-4 max-w-screen-xl mx-auto w-full">
      <h1>Course Requirements Quick Check</h1>
      <TreeView data={treeData} />
    </div>
  );
};

export default CourseTreeView;
