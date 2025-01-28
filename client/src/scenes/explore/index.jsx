import React, { useEffect, useState } from "react";
import ShootingStarField from "../../components/ShootingStarField";

const Explore = () => {
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:4000/api/stories");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Data received:", data);

        // Assuming data is an array of objects with 'story' field
        setStories(data);
        setError(null);
      } catch (error) {
        console.error("Fetching data failed:", error);
        setError("Failed to load stories. Please try again later.");
        setStories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <h3 className="text-2xl font-bold mb-4">Explore</h3>
        <div className="text-gray-600">Loading stories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <h3 className="text-2xl font-bold mb-4">Explore</h3>
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <ShootingStarField></ShootingStarField>
      <h3 className="text-2xl font-bold mb-4">Explore</h3>

      {stories.length === 0 ? (
        <div className="text-gray-600">
          No stories found. Be the first to share!
        </div>
      ) : (
        <div className="grid gap-4">
          {stories.map((storyData, index) => (
            <div
              key={storyData.id || index}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <p className="text-gray-800">{storyData.story}</p>
              {storyData.date && (
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(storyData.date).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
