import "./about.css";

const About = () => {
    return (
        <div className="container">
            <div class="line"></div>
            <h2 className="title">About</h2>

            <h3 className="subtitle">Inspiration</h3>
            <p className="text">
                I took a visual arts class in my second year of studying CS. For
                our midterm project, this guy in my class drew this amazing
                triptych featuring the idea of sonder. I love hearing about
                people's lives, and I took inspiration from this and decided to
                create a simple platform where people can share their stories as
                a project.
            </p>
            <h3 className="subtitle">Technicals</h3>
            <p className="text">
                This project was built with React, Express, and SQLite. I'm
                passionate about AI tools, this project utilizes OpenAI's
                omni-moderation-latest model to filter out inappropiate content.
                All code is available on{" "}
                <a target="blank" href="https://github.com/marlotea/sonder">
                    <u>my repo</u>
                </a>
                .
            </p>
        </div>
    );
};

export default About;
