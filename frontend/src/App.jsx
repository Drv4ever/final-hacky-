import React, { useState } from "react";
import "./App.css";

function ResumeInterviewApp() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setQuestions([]);
    setFeedback("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please upload a resume file.");
      return;
    }

    setLoading(true);
    setError("");
    setQuestions([]);
    setFeedback("");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch("https://final-hacky-backend.onrender.com/process-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process resume.");
      }

      const data = await response.json();
      setQuestions(data.questions || []);
      setFeedback(data.feedback || "No feedback received.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>interview.ai</h1>
        <p>
          Upload your resume.
          <br />
          Get tailored interview questions and feedback
        </p>
      </div>

      <div className="upload-card">
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="file-input-wrapper">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="file-input"
              id="resume-upload"
            />
            <label htmlFor="resume-upload" className="file-label">
              {file ? file.name : "Choose resume file"}
            </label>
          </div>

          {file && (
            <div className="file-preview-card">
              <div className="file-preview-content">
                <div className="file-icon">📄</div>
                <div className="file-details">
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <button
                  type="button"
                  className="remove-file-btn"
                  onClick={() => {
                    setFile(null);
                    document.getElementById("resume-upload").value = "";
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file}
            className="submit-button"
          >
            {loading ? "Processing..." : "Analyze Resume"}
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      {questions.length > 0 && (
        <div className="results-card">
          <h3>Interview Questions</h3>
          <ul className="questions-list">
            {questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      {feedback && (
        <div className="results-card">
          <h3>Resume Feedback</h3>
          <p className="feedback-text">{feedback}</p>
        </div>
      )}
    </div>
  );
}

export default ResumeInterviewApp;
