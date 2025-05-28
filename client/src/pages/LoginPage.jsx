import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../utils/api";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    text: {
      fontSize: "14px",
      color: "#555",
      marginBottom: "20px",
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
    rememberMe: {
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
    forgotPassword: {
      display: "block",
      margin: "15px 0",
      color: "#007bff",
      textDecoration: "none",
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
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });

      const data = response.data;

      if (response.status === 200) {
        console.log("Login successful!", data);
        
        // Save token to localStorage and update auth headers
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("lastActivity", new Date().getTime().toString());
        
        // Set the auth token in the API utility
        setAuthToken(data.token);
        
        // Force the authorization header in current request
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token.trim()}`;
        
        console.log("Auth token set. Current token in localStorage:", localStorage.getItem("token"));
        console.log("Current user in localStorage:", localStorage.getItem("user"));
        console.log("API Headers:", api.defaults.headers.common);
        
        alert("Login successful! Redirecting to dashboard...");
        
        // Try direct window location navigation instead of React Router
        window.location.href = "/dashboard";
        
        // As a fallback, also try React Router navigation after a delay
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 500);
      } else {
        setErrorMessage(data.message || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(error.response?.data?.message || "Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.heading}>Welcome back!</h2>
        <p style={styles.text}>Enter your credentials to access your account</p>
        {errorMessage && <p style={styles.error}>{errorMessage}</p>}
        <form onSubmit={handleLogin}>
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

          <div style={styles.rememberMe}>
            <input type="checkbox" id="remember" name="remember" />
            <label htmlFor="remember"> Remember for 30 days</label>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <a href="/forgot-password" style={styles.forgotPassword}>
          Forgot password?
        </a>
        <p style={styles.signupText}>
          Don't have an account?{" "}
          <a href="/signup" style={styles.signupLink}>
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
