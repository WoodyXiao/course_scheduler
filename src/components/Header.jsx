import React, { useState } from 'react';
import logo from '../assets/logo/SFU_block_colour_rgb.png'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-sfu-light-red border-gray-200">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src={logo} className="h-8" alt="Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
            SFU Courses Scheduler
          </span>
        </a>
        <button
          data-collapse-toggle="navbar-default"
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          aria-controls="navbar-default"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>
        <div className={`${isOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`} id="navbar-default">
          <ul className="flex flex-col p-4 md:p-0 mt-4 rounded-lg bg-sfu-light-red md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0">
            <li>
              <a
                href="/"
                className="block py-2 px-3 text-white rounded hover:bg-sfu-dark-red md:hover:bg-sfu-dark-red md:p-0"
              >
                Courses Treeview
              </a>
            </li>
            <li>
              <a
                href="/"
                className="block py-2 px-3 text-white rounded hover:bg-sfu-dark-red md:hover:bg-sfu-dark-red md:p-0"
              >
                About
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
