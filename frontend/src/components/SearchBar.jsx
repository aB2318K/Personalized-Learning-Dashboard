import React from 'react';
import { HiSearch } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { validKeywords } from '../assets/validKeywords';

function SearchBar({ searchTerm, setSearchTerm, forumSearchTerm, setForumSearchTerm }) {
  const navigate = useNavigate();

  const isForum = location.pathname.startsWith('/forum');

  // Function to handle the video search
  const handleSearch = () => {
    const sanitizedSearchTerm = searchTerm.trim().replace(/\s+/g, ' ');
    if (!sanitizedSearchTerm || sanitizedSearchTerm.length <= 2) {
      return; // Do nothing if search term is empty
    }
    const combinedSearchTerm = sanitizedSearchTerm.replace(/\s+/g, '').toLowerCase();
    let matchedKeyword = null;
    // First, look for exact matches
    validKeywords.forEach(validKeyword => {
      const keywordWithoutSpaces = validKeyword.replace(/\s+/g, '').toLowerCase(); // Remove spaces and convert to lowercase
      // Exact match check (case insensitive)
      if (combinedSearchTerm === keywordWithoutSpaces) {
        matchedKeyword = validKeyword;
      }
    });
    // If no exact match is found, look for partial matches
    if (!matchedKeyword) {
      validKeywords.forEach(validKeyword => {
        // Check if the combined search term is a substring of any valid keyword
        const keywordWithoutSpaces = validKeyword.replace(/\s+/g, '').toLowerCase(); // Remove spaces and convert to lowercase

        if (keywordWithoutSpaces.includes(combinedSearchTerm)) {
          matchedKeyword = validKeyword;
        }
      });
    }
    // If a valid match is found, navigate with the matched keyword
    if (matchedKeyword) {
      navigate(`/dashboard/search?searchTerm=${matchedKeyword}`);
    } else {
      navigate('/dashboard/search?searchTerm=invalid'); 
    }
  };

  // Forum post search
  const handleForumSearch = () => {
    navigate(`/forum/search?searchTerm=${forumSearchTerm}`)
  }

  // Handle pressing Enter key to trigger search
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      isForum ? handleForumSearch() : handleSearch();
    }
  };

  // Handle change in input and prevent multiple spaces
  const handleChange = (e) => {
    const value = e.target.value.replace(/\s+/g, ' '); // Replace multiple spaces with a single space
    isForum ? setForumSearchTerm(value) : setSearchTerm(value);
  };

  return (
    <div className="flex items-center md:w-full w-4/5 max-w-lg bg-white rounded-full border border-gray-300">
      {/* Search Input */}
      <input
        type="text"
        value={isForum ? forumSearchTerm : searchTerm}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={isForum ? "Search in forum" : "Search"}
        className="w-full p-1 md:p-2 rounded-l-full focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-300 text-sm md:text-base"
      />

      {/* Search Button */}
      <button
        className="searchBtn p-1 md:p-2 rounded-r-full bg-gray-600 text-white hover:bg-gray-700 focus:outline-none"
        onClick={isForum ? handleForumSearch : handleSearch}
      >
        <HiSearch className="h-6 w-4 md:h-7 md:w-5" />
      </button>
    </div>
  );
}

export default SearchBar;
