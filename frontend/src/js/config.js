const isLocal = window.location.hostname === "localhost"
  || window.location.hostname === "127.0.0.1"
  || window.location.hostname === "0.0.0.0";

const API_URL = isLocal
  ? "http://localhost:8081/tasty-app-bff"
  : "https://teu-bff-hml.fly.dev/tasty-app-bff";

const AUTH_URL = isLocal
  ? "http://localhost:8085/tasty-auth-service"
  : "https://teu-auth-hml.fly.dev/tasty-auth-service";