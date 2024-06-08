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
                                },
                                {
                                  name: "OR",
                                  condition: "OR",
                                  children: [
                                    { name: "CMPT 129" },
                                    { name: "CMPT 135" },
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
                        },
                        {
                          name: "ENSC 254",
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
              children: [{ name: "CMPT 371" }],
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
