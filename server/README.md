# Griptech Server - Enhanced Authentication Setup

This server implements secure cross-domain authentication using httpOnly cookies and JWT tokens.

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/griptech"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here" # Optional, defaults to JWT_SECRET
JWT_EXPIRES_IN="24h" # Optional, defaults to 24h

# Cookie Configuration (for cross-domain authentication)
COOKIE_DOMAIN=".griptech.se" # Set to your root domain with leading dot for cross-subdomain sharing

# Server Configuration
PORT=3001
NODE_ENV="production" # or "development"
```

## Cross-Domain Authentication Setup

### For Production (EC2 + Amplify)

1. **Set the cookie domain** to your root domain:
   ```env
   COOKIE_DOMAIN=".griptech.se"
   ```

2. **Update CORS origins** in `src/index.ts` to include your domains:
   ```typescript
   const allowedOrigins = [
     "https://main.d3rzdlhtikzd4k.amplifyapp.com",
     "https://griptech.se",
     "https://www.griptech.se",
     "http://localhost:3000",
     "https://localhost:3000",
   ];
   ```

3. **Ensure HTTPS** is enabled on both your EC2 backend and Amplify frontend.

### For Development

1. **Cookie domain** can be omitted or set to localhost:
   ```env
   COOKIE_DOMAIN="localhost"
   ```

2. **CORS origins** should include your development URLs.

## Authentication Flow

1. **Login**: User credentials are validated, and both access and refresh tokens are set as httpOnly cookies
2. **Session Check**: The `/api/session` endpoint validates the access token and automatically refreshes if needed
3. **Token Refresh**: When the access token expires, the refresh token is used to generate new tokens
4. **Logout**: Both tokens are cleared from cookies

## Security Features

- **httpOnly Cookies**: Tokens are stored in httpOnly cookies, preventing XSS attacks
- **Automatic Token Refresh**: Seamless token refresh without user intervention
- **Cross-Domain Support**: Proper CORS configuration for separate frontend/backend domains
- **CSRF Protection**: Origin validation for state-changing operations
- **Secure Cookie Settings**: Production cookies are secure and use appropriate sameSite settings

## API Endpoints

- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/session` - Check authentication status (with auto-refresh)
- `POST /api/refresh` - Manual token refresh

## Client Configuration

The Next.js frontend should:

1. Use `credentials: "include"` in all API requests
2. Handle 401 responses by redirecting to login
3. Use the enhanced RTK Query configuration with automatic token refresh

## Troubleshooting

### Cookies Not Being Set
- Ensure `COOKIE_DOMAIN` is correctly configured
- Check that your domains are in the CORS allowed origins
- Verify HTTPS is enabled in production

### Cross-Domain Issues
- Set `sameSite: "none"` and `secure: true` for production
- Ensure both domains are in CORS allowed origins
- Check browser console for CORS errors

### Token Refresh Issues
- Verify `JWT_REFRESH_SECRET` is set (or it defaults to `JWT_SECRET`)
- Check that refresh tokens are being set correctly
- Monitor server logs for refresh token validation errors 