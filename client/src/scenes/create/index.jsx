import { useRef, useState, useEffect } from "react";
import ScrollingText from "../../components/ScrollingText";
import "../../App.css";

const Create = () => {
    const editorRef = useRef(null);
    const [isEmpty, setIsEmpty] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    useEffect(() => {
        // Set focus to the editor when component mounts
        editorRef.current?.focus();
    }, []);

    const formatText = (command) => {
        document.execCommand(command, false, null);
        editorRef.current.focus();
    };

    const handleInput = (e) => {
        if (!hasInteracted) {
            setHasInteracted(true);
            editorRef.current.textContent = e.target.textContent.replace(
                "Start typing here...",
                ""
            );
        }
        const textContent = editorRef.current.textContent.trim();
        setIsEmpty(textContent === "");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEmpty) {
            alert("Please enter some text before submitting");
            return;
        }
        try {
            setIsSubmitting(true);
            const content = editorRef.current.textContent.trim();
            console.log("Submitting content:", content);

            const response = await fetch("http://localhost:4000/api/stories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Network response was not ok"
                );
            }

            const data = await response.json();
            console.log("Success:", data);

            editorRef.current.textContent = "";
            setIsEmpty(true);
            setHasInteracted(false);
        } catch (error) {
            console.error("Error:", error);
            alert(
                error.message || "Failed to submit the text. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center max-w-4xl mx-auto space-y-8 p-6">
            <p className="promptTitle text-center">prompts</p>
            <ScrollingText />

            <div className="toolbar w-full flex justify-center space-x-4">
                <button onClick={() => formatText("bold")}>
                    <b>B</b>
                </button>
                <button onClick={() => formatText("italic")}>
                    <i>I</i>
                </button>
                <button onClick={() => formatText("underline")}>
                    <u>U</u>
                </button>
                <button onClick={() => formatText("strikethrough")}>
                    <s>S</s>
                </button>
            </div>

            <div
                ref={editorRef}
                className={`editor max-w-2xl w-full ${
                    !hasInteracted
                        ? "before:content-['Start_typing_here...'] before:text-gray-400"
                        : ""
                }`}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
            ></div>

            <button
                className="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || isEmpty}
            >
                <span>{isSubmitting ? "posting..." : "post"}</span>
                <svg
                    height="16"
                    width="16"
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.1"
                    viewBox="0 0 1024 1024"
                >
                    <path d="M149.309584 495.52477c0 11.2973 9.168824 20.466124 20.466124 20.466124l604.773963 0-188.083679 188.083679c-7.992021 7.992021-7.992021 20.947078 0 28.939099 4.001127 3.990894 9.240455 5.996574 14.46955 5.996574 5.239328 0 10.478655-1.995447 14.479783-5.996574l223.00912-223.00912c3.837398-3.837398 5.996574-9.046027 5.996574-14.46955 0-5.433756-2.159176-10.632151-5.996574-14.46955l-223.019353-223.029586c-7.992021-7.992021-20.957311-7.992021-28.949332 0-7.992021 8.002254-7.992021 20.957311 0 28.949332l188.073446 188.073446-604.753497 0C158.478408 475.058646 149.309584 484.217237 149.309584 495.52477z"></path>
                </svg>
            </button>
            <p>
                Sonder uses OpenAI's moderation model to determine if the input
                is inappropriate. if you believe there is an error in judgement,
                please reach out at leiahjchen@gmail.com
            </p>
        </div>
    );
};

export default Create;
