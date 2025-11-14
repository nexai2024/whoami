# Template Images

This directory should contain the thumbnail images for page templates.

## Required Images

Based on the seed file (`prisma/seed-templates.ts`), the following images are expected:

1. `personal-brand.png` - Personal Brand template thumbnail
2. `business-professional.png` - Business Professional template thumbnail
3. `creative-portfolio.png` - Creative Portfolio template thumbnail
4. `link-in-bio.png` - Link in Bio Pro template thumbnail
5. `product-launch.png` - Product Launch template thumbnail
6. `course-creator.png` - Course Creator Hub template thumbnail
7. `minimalist-profile.png` - Minimalist Profile template thumbnail
8. `event-landing.png` - Event Landing Page template thumbnail
9. `service-business.png` - Service Business template thumbnail
10. `newsletter-signup.png` - Newsletter Signup template thumbnail

## Image Specifications

- **Format**: PNG (recommended) or JPG
- **Aspect Ratio**: 16:9 (recommended for consistency)
- **Recommended Size**: 1200x675px or larger
- **File Size**: Keep under 500KB for optimal loading

## Notes

- These images are referenced in the database seed file
- Images should be placed directly in this `public/templates/` directory
- The paths in the database are relative (e.g., `/templates/personal-brand.png`)
- Next.js will serve these from the `public` directory automatically


