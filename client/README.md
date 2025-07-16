# Griptech Client - Enhanced Authentication Setup

This Next.js frontend is configured for secure cross-domain authentication with automatic token refresh.

## Environment Variables

Create a `.env.local` file in the client directory:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL="https://your-ec2-domain.com" # Production
# NEXT_PUBLIC_API_BASE_URL="http://localhost:3001" # Development

# AWS Configuration (if using S3 for images)
NEXT_PUBLIC_AWS_BUCKET_PREFIX="https://your-bucket.s3.region.amazonaws.com"
```

## Authentication Features

### Automatic Token Refresh
The RTK Query configuration automatically handles token refresh when requests fail with 401 errors:

1. **Initial Request**: API call is made with current credentials
2. **401 Response**: If the access token is expired, a refresh request is automatically made
3. **Token Refresh**: New access and refresh tokens are set via httpOnly cookies
4. **Retry**: The original request is retried with the new tokens
5. **Fallback**: If refresh fails, user is redirected to login

### Cross-Domain Cookie Handling
- All API requests use `credentials: "include"` to send cookies
- Cookies are automatically handled by the browser
- No manual token management required

## Key Components

### API Configuration (`src/app/state/api.ts`)
- Enhanced base query with automatic token refresh
- All endpoints configured with `credentials: "include"`
- Automatic 401 handling and login redirect

### Authentication Context (`src/app/context/AuthContext.tsx`)
- Provides authentication state throughout the app
- Automatic polling to keep session fresh
- Role-based access control

### Middleware (`src/middleware.ts`)
- Route protection for admin pages
- Automatic redirects based on authentication status
- Locale-aware routing

## Usage Examples

### Making Authenticated API Calls
```typescript
// RTK Query automatically handles authentication
const { data, isLoading } = useGetAuthStatusQuery();
const [loginUser] = useLoginUserMutation();
const [logoutUser] = useLogoutUserMutation();

// Login
await loginUser({ email: "user@example.com", password: "password" });

// Logout
await logoutUser();
```

### Server Actions
```typescript
// Server actions automatically include auth tokens
import { getAuthToken } from "@/app/lib/utils/get-auth-token";

export async function fetchUserProfile() {
  const authToken = await getAuthToken();
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/profile`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  
  return response.json();
}
```

## Security Best Practices

1. **Never store tokens in localStorage** - All tokens are httpOnly cookies
2. **Use HTTPS in production** - Required for secure cookies
3. **Handle errors gracefully** - 401 responses trigger automatic refresh
4. **Validate user roles** - Check roles before rendering admin content

## Troubleshooting

### Authentication Issues
- Check browser console for CORS errors
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct
- Ensure both domains are in server CORS configuration
- Check that cookies are being set (Network tab in DevTools)

### Token Refresh Problems
- Monitor Network tab for refresh requests
- Check server logs for refresh token validation
- Verify `JWT_REFRESH_SECRET` is configured on server

### Cross-Domain Issues
- Ensure `COOKIE_DOMAIN` is set correctly on server
- Check that domains are in CORS allowed origins
- Verify HTTPS is enabled in production

## Development vs Production

### Development
- Use `http://localhost:3001` for API base URL
- Cookies work on localhost without domain configuration
- CORS allows localhost origins

### Production
- Use your EC2 domain for API base URL
- Set `COOKIE_DOMAIN` to your root domain
- Ensure HTTPS is enabled
- Configure CORS for your production domains
