/**
 *  This component will handle the course priority from the student
 */

import React from "react";

const CoursePrioritySlider = ({ priority, onChange }) => {
  return (
    <div>
      <input
        type="range"
        min="0"
        max="10"
        step="1"
        value={priority}
        onChange={(e) => onChange(e.target.value)}
      />
      <span>{priority}</span>
    </div>
  );
};

export default CoursePrioritySlider;
