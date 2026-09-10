const isLocal = window.location.hostname === "localhost"
  || window.location.hostname === "127.0.0.1"

const API_URL = isLocal
  ? "http://localhost:8081/tasty-app-bff"
  : "https://tasty-app-bff.fly.dev/tasty-app-bff";

const AUTH_URL = isLocal
  ? "http://localhost:8085/tasty-auth-service"
  : "https://tasty-auth-service.fly.dev/tasty-auth-service";