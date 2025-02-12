import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

function ForumSearchResults({ token }) {
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('searchTerm');
    const [results, setResults] = useState([]);

    useEffect(() => {
        const fetchResults = async () => {
            if (!searchTerm) return;
            try {
                const response = await fetch(`https://personalized-learning-dashboard.onrender.com/questions/search?q=${searchTerm}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch search results.');
                }

                const data = await response.json();
                setResults(data.posts);
            } catch (err) {
                console.error(err.message);
            }
        };

        fetchResults();
    }, [searchTerm, token]);

    return (
        <div className="py-6 px-4">
            <div className="space-y-6 max-w-3xl mx-auto">
                {results.length > 0 ? (
                    results.map((post) => (
                        <div
                            key={post._id}
                            className="w-full mb-4 border-b border-gray-200 pb-4"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 font-medium text-sm">
                                    {post.user?.firstname} {post.user?.lastname}
                                </span>
                                <span className="text-sm text-gray-500">
                                    Posted on <span className="font-medium">{new Date(post.createdAt).toLocaleDateString('en-GB')}</span>
                                </span>
                            </div>

                            <Link to={`/forum/post/${post._id}`}>
                                <h2 className="mt-2 text-xl font-semibold text-gray-700 hover:text-gray-900">
                                    {post.title}
                                </h2>
                            </Link>

                            <div className="text-gray-600 break-all">
                                {post.description.length > 100
                                    ? post.description.substring(0, 100) + '...'
                                    : post.description}
                            </div>

                            <Link to={`/forum/post/${post._id}`} className="mt-4 flex items-center justify-between">
                                <span className="text-gray-500 text-sm">{post.answersCount} Answers</span>
                            </Link>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No results found for "{searchTerm}"</p>
                )}

                {/* Back Button */}
                <div className="mt-8 text-center">
                    <Link to="/forum" className="text-gray-500 hover:underline">Back to Forum</Link>
                </div>
            </div>
        </div>
    );
}

export default ForumSearchResults;
