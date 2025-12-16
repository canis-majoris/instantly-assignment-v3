# Instantly Coding Assignment

## Overview
For this coding assignment you will build an email client (like Gmail, Apple Mail, etc.).

The project is set up for you already with everything you need:
1. A NextJS server (use it for both the frontend and the backend via API routes).
2. Database client (drizzle), using Sqlite (similar syntax to MySQL or Postgres)
3. The main page layout with a list of existing emails

## Assignments
1. Display the email content on the right side when clicking an email
2. Add a way to send a new email. The email composer should have the following fields: "subject", "to", "cc", "bcc", and "content".
3. Make the search bar work. When the user types something, the email list should be updated to display only the emails where the search term is contained in any of the fields "subject", "to", "cc", "bcc", and "content". Use debounce to make sure the search doesn't trigger on every keystroke.

## Bonus Points
1. Right now the emails are NOT grouped by the thread id - we can see all the emails in the inbox. Implement threading (show only the latest email per thread in the Inbox).
2. Make the left sidebar filters work (Inbox/Important/Sent).
3. Implement the remove functionality.
