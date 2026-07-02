# Variables & Constants

## principal

### `MFA_SCOPE`
The scope a route requires to be sure the caller cleared their second factor (twoFactor plugin).
```ts
const MFA_SCOPE: "mfa:verified"
```

## dev-login

### `DEV_LOGIN_PASSWORD`
The fixed internal password the dev-login uses to drive email/password sign-up + sign-in. Not a real credential.
```ts
const DEV_LOGIN_PASSWORD: "suluk-dev-login-fixed-pw-00000000"
```
