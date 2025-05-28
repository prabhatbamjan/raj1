import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/auth";

const Signup = () => {
  const navigate = useNavigate(); // Redirect function
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f5fff5",
    },
    box: {
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
      textAlign: "center",
      maxWidth: "400px",
      width: "100%",
    },
    heading: {
      fontSize: "24px",
      color: "#333",
      marginBottom: "10px",
    },
    label: {
      display: "block",
      textAlign: "left",
      margin: "10px 0 5px",
      color: "#333",
      fontSize: "14px",
    },
    input: {
      width: "100%",
      padding: "10px",
      marginBottom: "15px",
      border: "1px solid #ccc",
      borderRadius: "4px",
    },
    checkboxContainer: {
      textAlign: "left",
      marginBottom: "15px",
    },
    button: {
      backgroundColor: "#4caf50",
      color: "white",
      border: "none",
      padding: "10px",
      borderRadius: "4px",
      width: "100%",
      cursor: "pointer",
      opacity: loading ? "0.6" : "1",
    },
    signupText: {
      marginTop: "10px",
      color: "#333",
    },
    signupLink: {
      color: "#007bff",
      textDecoration: "none",
    },
    error: {
      color: "red",
      marginBottom: "15px",
    },
    success: {
      color: "green",
      marginBottom: "15px",
    },
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Signup successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000); // Redirect after 2s
      } else {
        setErrorMessage(data.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.heading}>Get Started Now</h2>
        {errorMessage && <p style={styles.error}>{errorMessage}</p>}
        {successMessage && <p style={styles.success}>{successMessage}</p>}
        <form onSubmit={handleSignup}>
          <label htmlFor="name" style={styles.label}>
            Name
          </label>
          <input
            type="text"
            id="name"
            placeholder="Enter your name"
            required
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label htmlFor="email" style={styles.label}>
            Email address
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            required
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password" style={styles.label}>
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            required
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div style={styles.checkboxContainer}>
            <input type="checkbox" id="terms" name="terms" required />
            <label htmlFor="terms"> I agree to the terms & policy</label>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>

        <p style={styles.signupText}>
          Have an account?{" "}
          <a href="/login" style={styles.signupLink}>
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
