# TODO: Restrict Technician Access to Mechanic Dashboard

## Tasks
- [x] Modify App.tsx: Add global redirect for technicians to "/mechanic" if not on that route, and restrict /settings to customers and admins only.
- [x] Modify ProtectedRoute.tsx: Update redirect logic to be role-specific (technicians to "/mechanic", admins to "/admin", customers to "/my-bookings").
- [ ] Test the implementation by logging in as a technician and trying to access other routes.
