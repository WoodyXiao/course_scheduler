import logo from '../assets/logo/SFU_block_colour_rgb.png';

const Footer = () => {
  return (
    <footer className="bg-white rounded-lg shadow dark:bg-gray-900">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <a
            href="/"
            className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
          >
            <img
              src={logo}
              className="h-8"
              alt="Logo"
            />
            <span className="self-center text-1xl font-semibold whitespace-nowrap dark:text-white">
              SFU Courses Scheduler
            </span>
          </a>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
            <li>
              <a href="/" className="hover:underline me-4 md:me-6">
                Course Treeview
              </a>
            </li>
            <li>
              <a href="/" className="hover:underline me-4 md:me-6">
                About
              </a>
            </li>
            <li>
              <a href="/" className="hover:underline me-4 md:me-6">
                Contact
              </a>
            </li>
          </ul>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © 2024{" "}
          <a href="https://github.com/WoodyXiao" className="hover:underline">
            Woody Xiao™
          </a>
          . All Rights Reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
