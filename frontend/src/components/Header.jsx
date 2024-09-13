import { FaSearch } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { BsJustifyRight, BsMessenger, BsSearch } from 'react-icons/bs'
const Header = () => {
  const [isActiveMoblie, setisActiveMoblie] = useState(false)
  const { currentUser } = useSelector((state) => state.user);
  const { notificationsDB } = useSelector(state => state.notification)
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  return (
    <header className="bg-slate-200 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        <Link to="/">
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-slate-500">Residence</span>
            <span className="text-slate-700">Navigator</span>
          </h1>
        </Link>
        <form
          onSubmit={handleSubmit}
          className="bg-slate-100 p-3 rounded-lg flex items-center"
        >
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent focus:outline-none w-24 sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>
            <FaSearch className="text-slate-600" />
          </button>
        </form>

        <ul className="flex gap-4 items-center">
          <Link to="/">
            <li className="hidden sm:inline text-slate-700 hover:text-slate-500">
              Home
            </li>
          </Link>
          <Link to="/contact">
            <li className="hidden sm:inline text-slate-700 hover:text-slate-500">
              Contact
            </li>
          </Link>
          <Link to="/about">
            <li className="hidden sm:inline text-slate-700 hover:text-slate-500">
              About
            </li>
          </Link>
          <li className='mr-9 capitalize text-lg text-brand-blue  '>
            <Link to={`${currentUser ? "/message" : "/login"}`}>
              <span className='relative'>
                <BsMessenger className='z-10' />
                {
                  notificationsDB.length === 0
                    ?
                    <p className={`text-xs px-[2px] font-heading font-medium bg-lime-600 text-white absolute  top-[-13px] right-[-14px]  flex items-center justify-center rounded-sm`}>new</p>
                    :
                    <p className={`text-[11px] font-content font-medium bg-[#c00] text-white absolute  top-[-10px] h-4 ${notificationsDB.length < 9 ? "w-3 right-[-8px]" : "w-4 right-[-10px]"} flex items-center justify-center rounded-sm`}>{notificationsDB.length}</p>
                }
              </span>
            </Link>
          </li>
          <Link to="/profile">
            {currentUser ? (
              <img
                src={currentUser.avatar}
                alt="avatar"
                className="rounded-full h-7 w-7 object-cover"
              />
            ) : (
              <button className="bg-slate-700 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded">
                Sign In
              </button>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
};

export default Header;