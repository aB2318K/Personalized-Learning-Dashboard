import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import ForumHome from "../components/forumComponents/ForumHome";

const Forum = ({ userId, token }) => {
  
    const [forumSearchTerm, setForumSearchTerm] = useState('');
  
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <Header forumSearchTerm={forumSearchTerm} setForumSearchTerm={setForumSearchTerm} userId={userId} token={token} />
        
        {/* Forum Content */}
        <div className="flex bg-gray-100 mt-8 md:mt-16 overflow-y-auto justify-center w-full">
          <ForumHome userId={userId} token={token} />
        </div>
      </div>
    );
};


export default Forum;
