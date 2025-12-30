# App Flow Document

## Onboarding and Sign-In/Sign-Up

When a brand-new user first visits the application, they land on a public introduction page that outlines the benefits of creating a personalized link-in-bio page. From there, the user can click a prominent button labeled either “Sign Up” or “Get Started” to begin account creation. The sign-up form asks for a name, email address, and password. Alternatively, the user can choose to register through a social login option such as Google or Facebook. If the user selects social login, they are redirected to the provider’s authentication page and then returned to the app with their account already created. Once the user submits the sign-up form, they receive an email verification link to confirm their address. After verifying, they are automatically signed in. On the same introduction page, an existing user can click “Sign In,” enter their email and password or choose a social login option, and are then directed into the application’s main area. If the user forgets their password, they select the “Forgot Password” link on the login form, enter their email address, receive a reset link, and then set a new password. Signing out is always available by clicking the user’s avatar in the top navigation and selecting “Log Out,” which returns them to the public landing page.

## Main Dashboard or Home Page

After signing in, the user arrives on the main dashboard, which offers a clear overview of activity and quick access to all core features. A vertical sidebar on the left displays links to the page builder, content library, store management, marketing tools, analytics, custom domain settings, coaching tools, and account settings. The top header shows the user’s name, a notifications icon, and a shortcut button for creating new items. In the center, the dashboard displays summary cards highlighting today’s page views, recent sales, upcoming coaching sessions, and active campaigns. These cards serve as shortcuts that the user can click to dive directly into detailed views of each feature. From this home page, the user can navigate seamlessly to any area of the application using the sidebar or the quick-create button in the header.

## Detailed Feature Flows and Page Transitions

### Page Builder Flow

When the user clicks the “Page Builder” link in the sidebar, they arrive at a gallery of predesigned templates and an option to start from scratch. Selecting a template opens the page builder workspace, which features a live preview on the right and a set of editing controls on the left. The user can drag text blocks, images, buttons, and social icons onto their page. As they adjust colors, fonts, or layout settings, the live preview updates in real time. When the user is satisfied, they click the “Save” button, which sends the updated design to the server and stores it. At any point, the user can click “Publish” to make their page live under their chosen URL.

### Content Management and Creation Flow

By choosing “Content Library” in the sidebar, the user sees a list of existing items such as courses, lead magnets, or blog posts. To create a new piece of content, they click the “New Content” button and are presented with a form that includes a title field and a rich text editor powered by Tiptap. The user can insert images, format text, and embed videos. Once they finish writing, the user clicks “Save Draft” to store their work or “Publish” to make it available on their page. After publishing, the new content appears in the library list, where the user can click to edit or view analytics specific to that item.

### E-commerce and Checkout Flow

When the user enters “Store Management” from the sidebar, they see a dashboard of products and courses they are selling. To add a new product, they click “Add Product,” fill in the name, description, price, and upload images, then click “Save.” The product is now available for customers to purchase. When a visitor clicks on the product link from the user’s public page, they land on a checkout form where they enter their payment information. Stripe handles the payment processing, and upon success the visitor sees a confirmation page. Back in the store dashboard, the user can click “Earnings” to view a breakdown of recent sales, total revenue, and export transaction history for any date range.

### Marketing Automation and Campaign Management Flow

By selecting “Marketing” from the sidebar, the user enters the campaign dashboard. Here they can click “Create Campaign” to launch a guided wizard. In the first step, the user names their campaign and chooses a template such as an email sequence or social media promotion. In the next steps, they write message content, select audience segments, and define send times or triggers. The wizard shows a real-time preview of each message. After completing all steps, the user clicks “Launch” or schedules the campaign for a future date. The new campaign appears in the marketing dashboard list, where the user can click it to view performance metrics or pause the campaign.

### Workflow Automation Flow

Under the “Workflows” link in the sidebar, the user finds a list of existing automation recipes. To create a new workflow, they click “New Workflow,” then choose a trigger event such as “New subscriber” or “Course purchase,” followed by one or more actions like sending an email or tagging a contact. As they add steps, the interface displays a flowchart diagram. Once configured, the user saves and activates the workflow. From the workflows list, they can enable, disable, or edit any automation.

### Analytics and Funnel Tracking Flow

Clicking “Analytics” opens a dashboard with graphs of page views, click-through rates, and conversion funnels. By default, it shows data for the past week. The user can change the date range and select specific pages or campaigns to filter the results. Clicking on any graph element drills down into detailed logs, where the user sees timestamps and user footprints. If the user wants to share a report, they click “Export” to download a CSV or PDF.

### Custom Domain and Subdomain Configuration Flow

When the user chooses “Domains” from the sidebar, they land on a page listing any connected custom domains or subdomains. To add a new one, they click “Add Domain,” enter the domain name, and receive DNS instructions. After updating DNS records at their registrar, the user clicks “Verify,” and the system checks for the correct configuration. Once verified, the user can assign that domain to any of their published pages. Removing a domain is as simple as clicking a “Delete” button next to the domain name.

### Coach Platform Flow

The user accesses coaching tools via the “Coach” link in the sidebar. The coach dashboard shows a calendar view of upcoming sessions and a client list. To schedule a new session, the coach clicks a “New Session” button, selects a client or leaves it open for booking, chooses date, time, and duration, and sets a price. After saving, the session appears on the calendar, and clients can book it through the published page. Coaches can click a client name to view their profile, session history, and feedback.

### Administrative Interface Flow

If the user has admin privileges, an “Admin” section appears in the sidebar. Clicking this opens the admin console with tabs for user management, subscription plan settings, and global application settings. In the user management area, the admin can search for accounts, view usage metrics, and change roles or suspend access. In the plan settings area, they can create, edit, or delete subscription tiers and set feature gates. Any changes made here take effect immediately across the platform.

## Settings and Account Management

Users manage their personal information by clicking the user avatar in the top header and selecting “Account Settings.” On this page, they can update their name, email address, and profile photo. A separate tab allows them to change their password by entering the current password and setting a new one. In the notifications section, users toggle email and system alerts. If the user is on a paid plan, a billing tab displays their current subscription, upcoming invoice dates, payment method on file, and past invoices for download. Users can upgrade or cancel their plan here. After saving any changes in this area, a confirmation message appears and the user can navigate back to the main dashboard using the sidebar or header logo.

## Error States and Alternate Paths

If the user enters invalid information on any form, such as a missing title or incorrectly formatted email, an inline error message appears next to the field explaining what must be corrected. When the application loses internet connectivity, a banner appears at the top of the screen saying “Connection Lost” with a retry button. During payment processing, if the credit card is declined or Stripe returns an error, the checkout form displays a clear message at the top describing the issue and prompts the user to re-enter payment details. If the user attempts to access a premium feature without the proper subscription, they see a modal explaining that the feature is not available on their current plan with a link to the pricing page. From any error state, users can correct the issue or follow the provided instructions to return to normal operation.

## Conclusion and Overall App Journey

In summary, a new user discovers the application through the public landing page, signs up with email or social login, and verifies their account. They arrive on the main dashboard where they can launch into building a personalized page, manage various content types, set up products and checkout, and configure marketing campaigns. As they grow, they review analytics, automate workflows, and link custom domains. Coaches can schedule sessions and manage client bookings. Administrators have a dedicated area for site-wide control. Throughout every step, clear messages guide the user, error states explain how to recover, and settings pages let the user manage their subscription and profile. From first sign-up to everyday management, the flow is designed to help each user publish their brand, engage an audience, and monetize their content without ever leaving the app.