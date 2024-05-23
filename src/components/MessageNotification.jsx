import React, { useState } from "react";

const MessageNotification = ({ message, status, className = "", onClose }) => {

  // 定义基于状态的背景颜色
  const bgColor =
    status === "success"
      ? "bg-green-500 hover:bg-green-700"
      : status === "error" || status === "failed"
      ? "bg-red-500 hover:bg-red-700"
      : "bg-blue-500 hover:bg-blue-700";

  return (
    <div
      className={`fixed top-0 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-between p-4 mb-4 text-base leading-5 text-white rounded-lg opacity-100 font-regular ${bgColor} ${className}`}
    >
      {message}
      <button
        onClick={onClose}
        className="ml-4 text-white bg-transparent p-1 rounded-lg focus:outline-none focus:shadow-outline"
        aria-label="Close"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  );
};

export default MessageNotification;
