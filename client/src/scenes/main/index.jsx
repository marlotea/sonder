import React, { useState, useEffect } from "react";
import "../../App.css";

const Index = () => {
  const [currentFont, setCurrentFont] = useState("Arial");

  // List of fonts to cycle through
  const fonts = [
    "Arial",
    "Courier New",
    "Georgia",
    "Times New Roman",
    "Verdana",
    "Comic Sans MS",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFont((prevFont) => {
        const currentIndex = fonts.indexOf(prevFont);
        const nextIndex = (currentIndex + 1) % fonts.length;
        return fonts[nextIndex];
      });
    }, 2000); // Change font every 2 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div>
      <body>
        <h1 id="title" style={{ fontFamily: currentFont }}>
          Sonder
        </h1>
        <a href="/create">
          <button className="cta">
            <span className="hover-underline-animation">share your story</span>
            <path
              id="Path_10"
              data-name="Path 10"
              d="M8,0,6.545,1.455l5.506,5.506H-30V9.039H12.052L6.545,14.545,8,16l8-8Z"
              transform="translate(30)"
            ></path>
          </button>
        </a>
        <a href="/explore">
          <button className="cta">
            <span className="hover-underline-animation">explore stories</span>
            <path
              id="Path_10"
              data-name="Path 10"
              d="M8,0,6.545,1.455l5.506,5.506H-30V9.039H12.052L6.545,14.545,8,16l8-8Z"
              transform="translate(30)"
            ></path>
          </button>
        </a>
        <a href="/about">
          <button className="cta">
            <span className="hover-underline-animation">about</span>
            <path
              id="Path_10"
              data-name="Path 10"
              d="M8,0,6.545,1.455l5.506,5.506H-30V9.039H12.052L6.545,14.545,8,16l8-8Z"
              transform="translate(30)"
            ></path>
          </button>
        </a>
      </body>
    </div>
  );
};

export default Index;
