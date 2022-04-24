import React, { useState, useEffect } from 'react';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { API_Urls } from '../constants/api-urls.js';
const axios = require('axios');
export const AutoComplete = () => {
  const [users, updateUsers] = useState([]);
  const [queryName, setQueryName] = useState('');
  const [onSearch$] = useState(() => new Subject());
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [panelState, setPanelState] = useState(false);
  const [totalCount, updateTotalCount] = useState(undefined);
  useEffect(() => {
    onSearch$.pipe(debounceTime(500), distinctUntilChanged()).subscribe({
      next: (val) => {
        if (val && val.length > 2) {
          getGithubUserData(val);
        } else {
          setLoading(false);
          setPanelState(false);
        }
      },
      error: (err) => console.log(err),
    });
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setLoading(true);
    setQueryName(value);
    onSearch$.next(value);
  };

  const getGithubUserData = (username) => {
    axios
      .get(API_Urls.github_user_details, {
        params: {
          q: username,
        },
      })
      .then((res) => {
        updateUsers(res.data.items);
        updateTotalCount(res.data.total_count);
        setPanelState(true);
      })
      .catch((error) => {
        console.log(error);
      })
      .then(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <div className="m-4 relative">
        <div class="border px-2 py-0.5 flex items-center justify-between rounded hover:outline">
          <input
            type="text"
            className="outline-none w-full"
            onChange={handleSearch}
            value={queryName}
            onFocus={() => {
              if (users.length) {
                setPanelState(true);
              }
            }}
            onBlur={() => {
              setLoading(false);
              // setPanelState(false);
            }}
          />
          <div className="flex items-center">
            <div className="opacity-20 mb-0.5">|</div>
            {!loading && (
              <div
                className={[
                  'opacity-30 cursor-pointer transform  transition ',
                  !panelState ? 'rotate' : 'rotate-180',
                ].join(' ')}
                onClick={() => {
                  if (users.length) {
                    setPanelState(!panelState);
                  }
                }}
              >
                <svg
                  class=" h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            )}
            {loading && (
              <div class="loader-2 center">
                <span></span>
              </div>
            )}
          </div>
        </div>

        <div className="shadow my-1 rounded max-h-96 overflow-auto absolute w-full z-10 bg-white">
          {users &&
            panelState &&
            users.map((ele, index) => (
              <div
                className="px-2  border-b last:border-none hover:bg-gray-100 py-1 cursor-pointer bg-white"
                onClick={() => {
                  setCurrentUser(ele);
                  setQueryName(ele.login);
                  setPanelState(false);
                }}
                key={index}
              >
                <div className="flex items-center ">
                  <div>
                    {' '}
                    <img
                      className="rounded-full w-8"
                      src={ele.avatar_url}
                      alt=""
                    />
                  </div>
                  <div className="ml-2">
                    {ele.login}
                    <div className="text-xs">{ele.id}</div>
                  </div>
                </div>
              </div>
            ))}
          {totalCount === 0 && (
            <div className="px-2  border-b last:border-none hover:bg-gray-100 py-1 cursor-pointer bg-white text-center">
              No results found!
            </div>
          )}
        </div>

        <div>
          {currentUser && (
            <div className="text-xs">
              Selected User Details :{' '}
              <span className="font-semibold">{currentUser.login}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default AutoComplete;
