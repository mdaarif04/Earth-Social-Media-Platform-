import React, { useEffect, useRef, useState } from "react";
import UserCard from "../UserCard.js";
import { useDispatch, useSelector } from "react-redux";
import { getDataAPI } from "../../utils/fetchData.js";
import { GLOBALTYPES } from "../../redux/actions/globalTypes.js";
import { useNavigate, useParams } from "react-router-dom";
import {
  addUser,
  getConversations,
} from "../../redux/actions/messageAction.js";

const LeftSide = () => {
  const { auth, message } = useSelector((state) => state);
  const [search, setSearch] = useState("");
  const [searchUsers, setSearchUsers] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const pageEnd = useRef();

  const { id } = useParams();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search) return setSearchUsers([]);

    try {
      const res = await getDataAPI(`search?username=${search}`, auth.token);
      setSearchUsers(res.data.users);
    } catch (err) {
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: err.response.data.msg },
      });
    }
  };
  const handleAddUser = (user) => {
    setSearch("");
    setSearchUsers([]);
    dispatch(addUser({ user, message }));
    return navigate(`/message/${user._id}`);
  };
  const isActive = (user) => {
    if (id === user._id) return "active";
    return "";
  };

  useEffect(() => {
    if (message.firstLoad) return;
    dispatch(getConversations({ auth }));
  }, [dispatch, auth, message.firstLoad]);

  // Load More
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((p) => p + 1);
        }
      },
      {
        threshold: 0.1,
      }
    );
    observer.observe(pageEnd.current);
  }, [setPage]);

  useEffect(() => {
    if (message.resultUsers >= (page - 1) * 9 && page > 1) {
      dispatch(getConversations({ auth, page }));
    }
  }, [dispatch, message.resultUsers, page, auth]);

  return (
    <>
      <form className="message_header" onSubmit={handleSearch}>
        <input
          type="text"
          value={search}
          placeholder="Enter username to Search..."
          onChange={(e) => setSearch(e.target.value)}
        />

        <button type="submit" style={{ display: "none" }}>
          Search
        </button>
      </form>

      <div className="message_chat_list">
        {searchUsers.length !== 0 ? (
          <>
            {searchUsers.map((user) => (
              <div
                key={user._id}
                className={`message_user ${isActive(user)}`}
                onClick={() => handleAddUser(user)}
              >
                <UserCard user={user} />
              </div>
            ))}
          </>
        ) : (
          <>
            {message.users?.map((user) => (
              <div
                key={user._id}
                className={`message_user ${isActive(user)}`}
                onClick={() => handleAddUser(user)}
              >
                <UserCard user={user} msg={true}>
                  <i className="fas fa-circle" />
                </UserCard>
              </div>
            ))}
          </>
        )}

        <button ref={pageEnd} style={{opacity: 0}}>Load More</button>
      </div>
    </>
  );
};

export default LeftSide;
