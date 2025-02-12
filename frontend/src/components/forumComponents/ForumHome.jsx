import React from "react";
import { useLocation, useParams } from "react-router-dom";
import ForumTabs from "./ForumTabs";
import MyPosts from "./MyPosts";
import Posts from "./Posts";
import PostPage from "./PostPage";
import ForumSearchResults from "./ForumSearchResults";

const ForumHome = ({ userId, token }) => {
    const location = useLocation();
    const { id } = useParams(); 

    const isMyPosts = location.pathname.startsWith('/forum/my-posts');
    const isPostPage = location.pathname.startsWith('/forum/post/') && id; 
    const isForumSearch = location.pathname.startsWith('/forum/search');

    let content;
    if (isPostPage) {
        content = <PostPage userId={userId} token={token} postId={id}/>;
    } else if (isMyPosts) {
        content = <MyPosts userId={userId} token={token} />;
    } else if (isForumSearch) {
        content = <ForumSearchResults token={token} />
    } else {
        content = <Posts token={token} />;
    }

    return (
        <div className="w-screen overflow-x-hidden h-full min-h-screen flex flex-col sm:bg-gray-50 md:w-1/2">
            {/* Conditionally render the ForumTabs */}
            {!isPostPage && <ForumTabs />}

            {/* Main Forum Content */}
            <div className="w-full">
                {content}
            </div>
        </div>
    );
};

export default ForumHome;
