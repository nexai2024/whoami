/**
 * Template Seed Script
 * Seeds 10 default page templates into the database
 * Run with: npx tsx prisma/seed-templates.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const templates = [
  // Template 1: Personal Brand (Bio Only)
  {
    name: "Personal Brand",
    description: "Perfect for creators and influencers building their personal brand",
    category: "Bio",
    templateType: "BIO_ONLY" as const,
    tags: ["creator", "personal", "influencer", "modern"],
    featured: true,
    isPublic: true,
    thumbnailUrl: "/templates/personal-brand.png",
    headerData: {
      displayName: "Alex Morgan",
      title: "Content Creator & Digital Nomad",
      company: "",
      bio: "Sharing my journey around the world while building a thriving online business. Join 50K+ people who follow my adventures in content creation, travel, and entrepreneurship. Let's connect and grow together! 🌍✨",
      email: "hello@alexmorgan.com",
      phone: "",
      website: "alexmorgan.com",
      location: "Bali, Indonesia",
      avatar: null,
      backgroundImage: null,
      socialLinks: {
        twitter: "alexmorgan",
        instagram: "alexmorgan",
        youtube: "alexmorgantv",
        tiktok: "alexmorgan",
        linkedin: "",
        facebook: "",
        github: ""
      },
      customIntroduction: "🎉 New YouTube video every Monday! Subscribe for behind-the-scenes content.",
      headerStyle: "gradient"
    },
    blocksData: []
  },

  // Template 2: Business Professional (Bio Only)
  {
    name: "Business Professional",
    description: "Clean and professional bio for executives and consultants",
    category: "Bio",
    templateType: "BIO_ONLY" as const,
    tags: ["business", "professional", "executive", "corporate"],
    featured: true,
    isPublic: true,
    thumbnailUrl: "/templates/business-professional.png",
    headerData: {
      displayName: "Jennifer Chen",
      title: "Chief Technology Officer",
      company: "TechVision Inc.",
      bio: "Technology executive with 15+ years of experience leading digital transformation initiatives for Fortune 500 companies. Passionate about building high-performing teams and delivering innovative solutions that drive business growth. Speaker, mentor, and advocate for women in tech.",
      email: "jchen@techvision.com",
      phone: "+1 (555) 123-4567",
      website: "jenniferchen.io",
      location: "San Francisco, CA",
      avatar: null,
      backgroundImage: null,
      socialLinks: {
        twitter: "jenniferchen",
        instagram: "",
        youtube: "",
        tiktok: "",
        linkedin: "jenniferchen",
        facebook: "",
        github: "jchen"
      },
      customIntroduction: "Available for speaking engagements and advisory roles",
      headerStyle: "card"
    },
    blocksData: []
  },

  // Template 3: Creative Portfolio (Full Page)
  {
    name: "Creative Portfolio",
    description: "Showcase your creative work with stunning galleries and project displays",
    category: "Portfolio",
    templateType: "FULL_PAGE" as const,
    tags: ["portfolio", "creative", "designer", "artist"],
    featured: true,
    isPublic: true,
    thumbnailUrl: "/templates/creative-portfolio.png",
    headerData: {
      displayName: "Maya Rodriguez",
      title: "Visual Designer & Art Director",
      company: "Freelance",
      bio: "I create meaningful visual experiences that tell stories and connect with audiences. Specializing in branding, illustration, and digital design for bold brands ready to make an impact.",
      email: "hello@mayarodriguez.design",
      phone: "",
      website: "mayarodriguez.design",
      location: "Brooklyn, NY",
      avatar: null,
      backgroundImage: null,
      socialLinks: {
        twitter: "",
        instagram: "mayarodesign",
        youtube: "",
        tiktok: "",
        linkedin: "mayarodriguez",
        facebook: "",
        github: "",
        //.custom: [{name: "Behance", url: "behance.net/mayarod"}]
      },
      customIntroduction: "Currently accepting projects for Q3 2025",
      headerStyle: "split"
    },
    blocksData: [
      {
        type: "PORTFOLIO",
        position: 0,
        title: "Featured Work",
        description: "Selected projects from recent collaborations",
        url: null,
        imageUrl: null,
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
        borderRadius: 8,
        data: {
          items: [
            { title: "Brand Identity for EcoLife", description: "Complete rebranding including logo, colors, and visual system", imageUrl: null, projectUrl: "https://behance.net/example1", tags: ["branding", "identity"] },
            { title: "Mobile App UI for Fitness+", description: "User interface design for health and wellness app", imageUrl: null, projectUrl: "https://behance.net/example2", tags: ["ui design", "mobile"] },
            { title: "Illustration Series: Urban Stories", description: "Digital illustration collection exploring city life", imageUrl: null, projectUrl: "https://behance.net/example3", tags: ["illustration", "digital art"] },
            { title: "Website Design for StartupX", description: "Modern landing page with interactive elements", imageUrl: null, projectUrl: "https://behance.net/example4", tags: ["web design", "ui/ux"] }
          ]
        }
      },
      {
        type: "DIVIDER",
        position: 1,
        title: "",
        description: null,
        url: null,
        imageUrl: null,
        backgroundColor: "#f3f4f6",
        textColor: "#9ca3af",
        borderRadius: 0,
        data: { style: "line", thickness: 1 }
      },
      {
        type: "CONTACT_FORM",
        position: 2,
        title: "Let's Work Together",
        description: "Have a project in mind? Send me a message!",
        url: null,
        imageUrl: null,
        backgroundColor: "#f9fafb",
        textColor: "#111827",
        borderRadius: 12,
        data: {
          fields: [
            { name: "name", type: "text", required: true, placeholder: "Your Name" },
            { name: "email", type: "email", required: true, placeholder: "Your Email" },
            { name: "project_type", type: "select", required: true, placeholder: "Project Type", options: ["Branding", "Web Design", "Illustration", "Other"] },
            { name: "message", type: "textarea", required: true, placeholder: "Tell me about your project" }
          ],
          submitButtonText: "Send Message",
          successMessage: "Thanks! I'll get back to you within 24 hours."
        }
      },
      {
        type: "SOCIAL_SHARE",
        position: 3,
        title: "Share My Portfolio",
        description: "Know someone who needs a designer?",
        url: null,
        imageUrl: null,
        backgroundColor: "#ffffff",
        textColor: "#6b7280",
        borderRadius: 8,
        data: {
          platforms: ["twitter", "linkedin", "facebook", "email"],
          shareText: "Check out Maya Rodriguez's amazing design portfolio!"
        }
      }
    ]
  },

  // Template 4: Link in Bio Pro (Full Page)
  {
    name: "Link in Bio Pro",
    description: "Perfect for social media - showcase all your important links in one place",
    category: "Link-in-Bio",
    templateType: "FULL_PAGE" as const,
    tags: ["linkinbio", "social", "simple", "essential"],
    featured: true,
    isPublic: true,
    thumbnailUrl: "/templates/link-in-bio.png",
    headerData: {
      displayName: "Chris Taylor",
      title: "Fitness Coach & Wellness Expert",
      company: "",
      bio: "Helping busy professionals build sustainable fitness habits. 💪 Free workout plans, nutrition tips, and motivation to reach your goals!",
      email: "",
      phone: "",
      website: "",
      location: "Los Angeles, CA",
      avatar: null,
      backgroundImage: null,
      socialLinks: {
        twitter: "",
        instagram: "coachchris",
        youtube: "coachchristaylor",
        tiktok: "coachchris",
        linkedin: "",
        facebook: "",
        github: "",
        // custom: []
      },
      customIntroduction: "📱 Follow for daily fitness tips!",
      headerStyle: "minimal"
    },
    blocksData: [
      {
        type: "LINK",
        position: 0,
        title: "🎥 My Latest YouTube Video",
        description: "5-Minute Morning Workout Routine",
        url: "https://youtube.com/watch?v=example",
        imageUrl: null,
        backgroundColor: "#ef4444",
        textColor: "#ffffff",
        borderRadius: 12,
        data: { icon: "youtube", featured: true }
      },
      {
        type: "LINK",
        position: 1,
        title: "📅 Book a 1-on-1 Coaching Call",
        description: "Limited spots available",
        url: "https://calendly.com/coachchris",
        imageUrl: null,
        backgroundColor: "#3b82f6",
        textColor: "#ffffff",
        borderRadius: 12,
        data: { icon: "calendar", featured: false }
      },
      {
        type: "LINK",
        position: 2,
        title: "📥 Free 30-Day Workout Plan",
        description: "Download my beginner-friendly guide",
        url: "https://coachchris.com/free-plan",
        imageUrl: null,
        backgroundColor: "#10b981",
        textColor: "#ffffff",
        borderRadius: 12,
        data: { icon: "download", featured: false }
      },
      {
        type: "EMAIL_CAPTURE",
        position: 3,
        title: "Join My Weekly Newsletter",
        description: "Fitness tips delivered every Monday",
        url: null,
        imageUrl: null,
        backgroundColor: "#f3f4f6",
        textColor: "#1f2937",
        borderRadius: 12,
        data: {
          placeholder: "Enter your email",
          buttonText: "Subscribe",
          successMessage: "Welcome! Check your inbox for a confirmation.",
          formId: null
        }
      },
      {
        type: "LINK",
        position: 4,
        title: "🛒 Shop My Fitness Gear",
        description: "Equipment I use and recommend",
        url: "https://amazon.com/shop/coachchris",
        imageUrl: null,
        backgroundColor: "#ffffff",
        textColor: "#111827",
        borderRadius: 12,
        data: { icon: "shopping-bag", featured: false }
      },
      {
        type: "LINK",
        position: 5,
        title: "💬 Join My Community Discord",
        description: "Connect with 1000+ members",
        url: "https://discord.gg/coachchris",
        imageUrl: null,
        backgroundColor: "#5865f2",
        textColor: "#ffffff",
        borderRadius: 12,
        data: { icon: "message-circle", featured: false }
      }
    ]
  },

  // Template 5: Product Launch (Full Page)
  {
    name: "Product Launch",
    description: "Launch your product with style - perfect for courses, ebooks, and digital products",
    category: "Product Launch",
    templateType: "FULL_PAGE" as const,
    tags: ["product", "launch", "sales", "ecommerce"],
    featured: true,
    isPublic: true,
    thumbnailUrl: "/templates/product-launch.png",
    headerData: {
      displayName: "",
      title: "The Complete Guide to Solopreneurship",
      company: "",
      bio: "Everything you need to start, grow, and scale your one-person business. 200+ pages of actionable strategies, real case studies, and proven frameworks used by successful solopreneurs earning $10K-$100K+ monthly.",
      email: "",
      phone: "",
      website: "",
      location: "",
      avatar: null,
      backgroundImage: null,
      socialLinks: {
        twitter: "",
        instagram: "",
        youtube: "",
        tiktok: "",
        linkedin: "",
        facebook: "",
        github: "",
        //custom: []
      },
      customIntroduction: "🔥 Limited Time: 40% Off Launch Price",
      headerStyle: "gradient"
    },
    blocksData: [
      {
        type: "PRODUCT",
        position: 0,
        title: "Get Instant Access",
        description: "Includes lifetime updates and bonus templates",
        url: null,
        imageUrl: null,
        backgroundColor: "#1f2937",
        textColor: "#ffffff",
        borderRadius: 16,
        data: {
          productId: null,
          price: 97,
          currency: "USD",
          ctaText: "Buy Now - $97",
          originalPrice: 197
        }
      },
      {
        type: "TEXT_BLOCK",
        position: 1,
        title: "What You'll Learn",
        description: null,
        url: null,
        imageUrl: null,
        backgroundColor: "#ffffff",
        textColor: "#374151",
        borderRadius: 8,
        data: {
          content: "✅ How to validate your business idea in 7 days\n✅ Building systems that run without you\n✅ Pricing strategies that maximize revenue\n✅ Marketing tactics that actually work\n✅ Scaling from $0 to $10K/month\n✅ Tools and automation for solopreneurs",
          alignment: "left"
        }
      },
      {
        type: "PROMO",
        position: 2,
        title: "Limited Time Bonus",
        description: "Get these extras free when you order today",
        url: null,
        imageUrl: null,
        backgroundColor: "#fef3c7",
        textColor: "#92400e",
        borderRadius: 12,
        data: {
          items: [
            "Solopreneur Business Plan Template ($47 value)",
            "Private Community Access ($297/year value)",
            "Monthly Live Q&A Sessions (Priceless)"
          ],
          expiresAt: null
        }
      },
      {
        type: "DIVIDER",
        position: 3,
        title: "",
        description: null,
        url: null,
        imageUrl: null,
        backgroundColor: "#f3f4f6",
        textColor: "#9ca3af",
        borderRadius: 0,
        data: { style: "line", thickness: 1 }
      },
      {
        type: "EMAIL_CAPTURE",
        position: 4,
        title: "Not Ready to Buy?",
        description: "Get the first chapter free + email course",
        url: null,
        imageUrl: null,
        backgroundColor: "#eff6ff",
        textColor: "#1e3a8a",
        borderRadius: 12,
        data: {
          placeholder: "Enter your email",
          buttonText: "Send Me Chapter 1",
          successMessage: "Check your inbox! First chapter is on its way.",
          formId: null
        }
      }
    ]
  },

  // Template 6: Course Creator (Full Page)
  {
    name: "Course Creator Hub",
    description: "Perfect for educators and course creators showcasing online programs",
    category: "Course Creator",
    templateType: "FULL_PAGE" as const,
    tags: ["education", "courses", "teaching", "learning"],
    featured: true,
    isPublic: true,
    thumbnailUrl: "/templates/course-creator.png",
    headerData: {
      displayName: "Sarah Williams",
      title: "Photography Mentor & Educator",
      company: "Capture Academy",
      bio: "Teaching aspiring photographers how to master their craft and build profitable photography businesses. With 12+ years of professional experience and 5,000+ students worldwide, I'm here to help you turn your passion into a career.",
      email: "hello@capture-academy.com",
      phone: "",
      website: "capture-academy.com",
      location: "Portland, OR",
      avatar: null,
      backgroundImage: null,
      socialLinks: {
        twitter: "",
        instagram: "captureacademy",
        youtube: "captureacademy",
        tiktok: "",
        linkedin: "sarahwilliams",
        facebook: "captureacademy",
        github: "",
        //custom: []
      },
      customIntroduction: "🎓 New cohort starting April 2025",
      headerStyle: "card"
    },
    blocksData: [
      {
        type: "TEXT_BLOCK",
        position: 0,
        title: "My Courses",
        description: "Comprehensive programs for every skill level",
        url: null,
        imageUrl: null,
        backgroundColor: "#f9fafb",
        textColor: "#111827",
        borderRadius: 8,
        data: {
          content: "From beginner fundamentals to advanced business strategies, each course includes video lessons, downloadable resources, and community support.",
          alignment: "center"
        }
      },
      {
        type: "PRODUCT",
        position: 1,
        title: "Photography Foundations",
        description: "Master camera settings, composition, and lighting in 8 weeks",
        url: null,
        imageUrl: null,
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
        borderRadius: 12,
        data: {
          productId: null,
          price: 297,
          currency: "USD",
          ctaText: "Enroll Now"
        }
      },
      {
        type: "PRODUCT",
        position: 2,
        title: "Advanced Portrait Techniques",
        description: "Take your portraits to the next level with pro techniques",
        url: null,
        imageUrl: null,
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
        borderRadius: 12,
        data: {
          productId: null,
          price: 497,
          currency: "USD",
          ctaText: "Enroll Now"
        }
      },
      {
        type: "PRODUCT",
        position: 3,
        title: "Photography Business Blueprint",
        description: "Build a $5K/month photography business from scratch",
        url: null,
        imageUrl: null,
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
        borderRadius: 12,
        data: {
          productId: null,
          price: 697,
          currency: "USD",
          ctaText: "Enroll Now"
        }
      },
      {
        type: "NEWSLETTER",
        position: 4,
        title: "Weekly Photography Tips",
        description: "Free lessons delivered to your inbox every Wednesday",
        url: null,
        imageUrl: null,
        backgroundColor: "#eff6ff",
        textColor: "#1e3a8a",
        borderRadius: 12,
        data: {
          placeholder: "Your email address",
          buttonText: "Subscribe Free",
          successMessage: "Welcome! Your first lesson is on the way.",
          frequency: "weekly"
        }
      },
      {
        type: "BOOKING_CALENDAR",
        position: 5,
        title: "Book a Free Strategy Call",
        description: "Not sure which course is right for you? Let's chat!",
        url: null,
        imageUrl: null,
        backgroundColor: "#f3f4f6",
        textColor: "#374151",
        borderRadius: 12,
        data: {
          calendarLink: "https://calendly.com/sarahwilliams/strategy",
          duration: "30 minutes",
          buttonText: "Schedule Call"
        }
      }
    ]
  },

  // Template 7: Minimalist Profile (Bio Only)
  {
    name: "Minimalist Profile",
    description: "Clean and simple bio for professionals who prefer understated elegance",
    category: "Minimalist",
    templateType: "BIO_ONLY" as const,
    tags: ["minimal", "clean", "simple", "elegant"],
    featured: true,
    isPublic: true,
    thumbnailUrl: "/templates/minimalist-profile.png",
    headerData: {
      displayName: "David Park",
      title: "Writer",
      company: "",
      bio: "Words about technology, culture, and the human condition. Published in The Atlantic, Wired, and MIT Technology Review.",
      email: "david@davidpark.io",
      phone: "",
      website: "davidpark.io",
      location: "Seattle",
      avatar: null,
      backgroundImage: null,
      socialLinks: {
        twitter: "davidparkwrites",
        instagram: "",
        youtube: "",
        tiktok: "",
        linkedin: "",
        facebook: "",
        github: "",
        //custom: [{name: "Medium", url: "medium.com/@davidpark"}]
      },
      customIntroduction: "",
      headerStyle: "minimal"
    },
    blocksData: []
  },

  // Template 8: Event Landing (Full Page)
  {
    name: "Event Landing Page",
    description: "Promote your event, workshop, or webinar with this conversion-focused template",
    category: "Event Landing",
    templateType: "FULL_PAGE" as const,
    tags: ["event", "workshop", "webinar", "conference"],
    featured: true,
    isPublic: true,
    thumbnailUrl: "/templates/event-landing.png",
    headerData: {
      displayName: "",
      title: "Design Systems Summit 2025",
      company: "",
      bio: "Join 500+ designers, developers, and product leaders for two days of learning, networking, and inspiration. Discover how leading companies build and scale their design systems for maximum impact.",
      email: "",
      phone: "",
      website: "",
      location: "Austin, TX + Virtual",
      avatar: null,
      backgroundImage: null,
      socialLinks: {
        twitter: "designsystemssummit",
        instagram: "",
        youtube: "",
        tiktok: "",
        linkedin: "design-systems-summit",
        facebook: "",
        github: "",
        //custom: []
      },
      customIntroduction: "📅 June 15-16, 2025 • Early Bird Pricing Ends Soon",
      headerStyle: "gradient"
    },
    blocksData: [
      {
        type: "TEXT_BLOCK",
        position: 0,
        title: "Why Attend?",
        description: null,
        url: null,
        imageUrl: null,
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
        borderRadius: 8,
        data: {
          content: "🎯 20+ expert speakers from companies like Airbnb, Shopify, and Microsoft\n🤝 Network with design system practitioners\n💡 Hands-on workshops and breakout sessions\n📚 Access to exclusive resources and templates\n🎟️ Virtual option available worldwide",
          alignment: "left"
        }
      },
      {
        type: "WAITLIST",
        position: 1,
        title: "Save Your Spot",
        description: "Early Bird: $299 (Regular: $499)",
        url: null,
        imageUrl: null,
        backgroundColor: "#1e40af",
        textColor: "#ffffff",
        borderRadius: 16,
        data: {
          placeholder: "Work email address",
          buttonText: "Register Now",
          successMessage: "You're in! Check your email for next steps.",
          collectPhone: false
        }
      },
      {
        type: "DIVIDER",
        position: 2,
        title: "",
        description: null,
        url: null,
        imageUrl: null,
        backgroundColor: "#f3f4f6",
        textColor: "#9ca3af",
        borderRadius: 0,
        data: { style: "dots", thickness: 2 }
      },
      {
        type: "TEXT_BLOCK",
        position: 3,
        title: "Featured Speakers",
        description: "Learn from the best in the industry",
        url: null,
        imageUrl: null,
        backgroundColor: "#f9fafb",
        textColor: "#111827",
        borderRadius: 8,
        data: {
          content: "**Emma Thompson** - Design Systems Lead, Airbnb\n**Marcus Chen** - Principal Designer, Shopify\n**Olivia Martinez** - Head of Design, Microsoft\n\n_...and 17 more amazing speakers_",
          alignment: "center"
        }
      },
      {
        type: "NEWSLETTER",
        position: 4,
        title: "Stay Updated",
        description: "Get speaker announcements and schedule updates",
        url: null,
        imageUrl: null,
        backgroundColor: "#eff6ff",
        textColor: "#1e3a8a",
        borderRadius: 12,
        data: {
          placeholder: "Your email",
          buttonText: "Subscribe",
          successMessage: "You'll be the first to know!",
          frequency: "event updates"
        }
      }
    ]
  },

  // Template 9: Service Business (Full Page)
  {
    name: "Service Business",
    description: "Perfect for consultants, agencies, and service providers",
    category: "Service Business",
    templateType: "FULL_PAGE" as const,
    tags: ["business", "consulting", "agency", "services"],
    featured: true,
    isPublic: true,
    thumbnailUrl: "/templates/service-business.png",
    headerData: {
      displayName: "Summit Digital",
      title: "Performance Marketing Agency",
      company: "",
      bio: "We help B2B SaaS companies scale from $1M to $10M ARR through data-driven paid acquisition strategies. Our proven frameworks have generated $50M+ in client revenue.",
      email: "hello@summitdigital.co",
      phone: "+1 (555) 987-6543",
      website: "summitdigital.co",
      location: "Remote • Global",
      avatar: null,
      backgroundImage: null,
      socialLinks: {
        twitter: "summitdigital",
        instagram: "",
        youtube: "",
        tiktok: "",
        linkedin: "summit-digital",
        facebook: "",
        github: "",
        //custom: []
      },
      customIntroduction: "Working with 25+ B2B SaaS companies",
      headerStyle: "split"
    },
    blocksData: [
      {
        type: "TEXT_BLOCK",
        position: 0,
        title: "Our Services",
        description: "Comprehensive growth solutions",
        url: null,
        imageUrl: null,
        backgroundColor: "#f9fafb",
        textColor: "#111827",
        borderRadius: 8,
        data: {
          content: "**Paid Acquisition** • Google Ads, LinkedIn Ads, paid social\n**Conversion Optimization** • Landing pages, A/B testing, analytics\n**Growth Strategy** • Market research, positioning, GTM planning\n**Creative Production** • Ad creative, video, landing page design",
          alignment: "left"
        }
      },
      {
        type: "LINK",
        position: 1,
        title: "📊 View Case Studies",
        description: "See how we've helped companies scale",
        url: "https://summitdigital.co/case-studies",
        imageUrl: null,
        backgroundColor: "#3b82f6",
        textColor: "#ffffff",
        borderRadius: 12,
        data: { icon: "bar-chart", featured: true }
      },
      {
        type: "BOOKING_CALENDAR",
        position: 2,
        title: "Book a Strategy Call",
        description: "30-minute consultation to discuss your growth goals",
        url: null,
        imageUrl: null,
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
        borderRadius: 12,
        data: {
          calendarLink: "https://calendly.com/summitdigital/strategy",
          duration: "30 minutes",
          buttonText: "Schedule Free Call"
        }
      },
      {
        type: "CONTACT_FORM",
        position: 3,
        title: "Get a Custom Proposal",
        description: "Tell us about your business and goals",
        url: null,
        imageUrl: null,
        backgroundColor: "#f3f4f6",
        textColor: "#374151",
        borderRadius: 12,
        data: {
          fields: [
            { name: "company", type: "text", required: true, placeholder: "Company Name" },
            { name: "email", type: "email", required: true, placeholder: "Work Email" },
            { name: "revenue", type: "select", required: true, placeholder: "Annual Revenue", options: ["$0-$1M", "$1M-$5M", "$5M-$10M", "$10M+"] },
            { name: "goals", type: "textarea", required: true, placeholder: "What are your growth goals?" }
          ],
          submitButtonText: "Request Proposal",
          successMessage: "Thanks! We'll send a custom proposal within 24 hours."
        }
      },
      {
        type: "SOCIAL_SHARE",
        position: 4,
        title: "Refer a Company",
        description: "Know a SaaS company that needs help scaling?",
        url: null,
        imageUrl: null,
        backgroundColor: "#ffffff",
        textColor: "#6b7280",
        borderRadius: 8,
        data: {
          platforms: ["linkedin", "twitter", "email"],
          shareText: "Check out Summit Digital - they help B2B SaaS companies scale with performance marketing"
        }
      }
    ]
  },

  // Template 10: Newsletter Signup (Full Page)
  {
    name: "Newsletter Signup",
    description: "Grow your email list with this focused lead generation page",
    category: "Newsletter Signup",
    templateType: "FULL_PAGE" as const,
    tags: ["newsletter", "email", "lead-gen", "subscribe"],
    featured: true,
    isPublic: true,
    thumbnailUrl: "/templates/newsletter-signup.png",
    headerData: {
      displayName: "",
      title: "The Growth Operator",
      company: "",
      bio: "A weekly newsletter for startup operators who want to build better systems, make smarter decisions, and grow faster. Join 12,000+ operators from companies like Stripe, Notion, and Linear.",
      email: "",
      phone: "",
      website: "",
      location: "",
      avatar: null,
      backgroundImage: null,
      socialLinks: {
        twitter: "growthoperator",
        instagram: "",
        youtube: "",
        tiktok: "",
        linkedin: "",
        facebook: "",
        github: "",
        // custom: []
      },
      customIntroduction: "📬 Every Tuesday at 9am PT • Free forever",
      headerStyle: "card"
    },
    blocksData: [
      {
        type: "NEWSLETTER",
        position: 0,
        title: "Get Weekly Insights",
        description: "One actionable lesson each week",
        url: null,
        imageUrl: null,
        backgroundColor: "#1e40af",
        textColor: "#ffffff",
        borderRadius: 16,
        data: {
          placeholder: "Enter your email",
          buttonText: "Subscribe Now",
          successMessage: "Welcome! Check your inbox to confirm your subscription.",
          frequency: "weekly"
        }
      },
      {
        type: "TEXT_BLOCK",
        position: 1,
        title: "What You'll Get",
        description: null,
        url: null,
        imageUrl: null,
        backgroundColor: "#f9fafb",
        textColor: "#1f2937",
        borderRadius: 8,
        data: {
          content: "✅ Deep dives on operations, growth, and systems thinking\n✅ Framework breakdowns you can implement immediately\n✅ Case studies from fast-growing startups\n✅ Tool recommendations and productivity hacks\n✅ Curated resources worth reading\n\nNo fluff. No spam. Unsubscribe anytime.",
          alignment: "left"
        }
      },
      {
        type: "DIVIDER",
        position: 2,
        title: "",
        description: null,
        url: null,
        imageUrl: null,
        backgroundColor: "#e5e7eb",
        textColor: "#9ca3af",
        borderRadius: 0,
        data: { style: "line", thickness: 1 }
      },
      {
        type: "TEXT_BLOCK",
        position: 3,
        title: "Recent Issues",
        description: "See what you've been missing",
        url: null,
        imageUrl: null,
        backgroundColor: "#ffffff",
        textColor: "#374151",
        borderRadius: 8,
        data: {
          content: "**Issue #47:** _How Notion Scales Customer Support_\n**Issue #46:** _The 80/20 Framework for Prioritization_\n**Issue #45:** _Building a Dashboard That Actually Gets Used_",
          alignment: "left"
        }
      },
      {
        type: "LINK",
        position: 4,
        title: "📖 Browse the Archive",
        description: "Read past issues before subscribing",
        url: "https://growthoperator.com/archive",
        imageUrl: null,
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
        borderRadius: 12,
        data: { icon: "book-open", featured: false }
      },
      {
        type: "SOCIAL_SHARE",
        position: 5,
        title: "Spread the Word",
        description: "Share with your network",
        url: null,
        imageUrl: null,
        backgroundColor: "#f3f4f6",
        textColor: "#6b7280",
        borderRadius: 8,
        data: {
          platforms: ["twitter", "linkedin", "email"],
          shareText: "Check out The Growth Operator newsletter - weekly insights for startup operators"
        }
      }
    ]
  },

  // Template 11: Creator Media Kit (Full Page)
  {
    name: "Creator Media Kit",
    description: "Pitch brands with a polished media kit that highlights reach, audience insights, and sponsorship offers.",
    category: "Creators/Influencers",
    industry: "Influencer",
    templateType: "FULL_PAGE" as const,
    tags: ["creator", "influencer", "media-kit", "sponsors"],
    featured: true,
    isPublic: true,
    thumbnailUrl: "/templates/creator-media-kit.png",
    headerData: {
      displayName: "Noelle Rivera",
      title: "Lifestyle & Travel Creator",
      company: "",
      bio: "8.5M+ monthly impressions | 420K followers across TikTok, Instagram, and YouTube. Partnered with Airbnb, Glossier, and Away.",
      email: "hello@noellerivera.com",
      phone: "",
      website: "noellerivera.com",
      location: "Miami, FL",
      avatar: null,
      backgroundImage: null,
      socialLinks: {
        instagram: "noellerivera",
        tiktok: "noellerivera",
        youtube: "noellerivera",
        twitter: "noellestudio",
        linkedin: "",
        facebook: "",
        github: ""
      },
      customIntroduction: "🧳 Currently booking Spring/Summer collaborations",
      headerStyle: "gradient"
    },
    blocksData: [
      {
        type: "STATS",
        position: 0,
        title: "Audience Snapshot",
        description: null,
        url: null,
        imageUrl: null,
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
        borderRadius: 12,
        data: {
          stats: [
            { label: "Total Audience", value: "420K" },
            { label: "Female Audience", value: "78%" },
            { label: "Avg Engagement", value: "6.2%" },
            { label: "Top Locations", value: "US • Canada • UK" }
          ]
        }
      },
      {
        type: "TEXT_BLOCK",
        position: 1,
        title: "Brand Collaborations",
        description: null,
        url: null,
        imageUrl: null,
        backgroundColor: "#f9fafb",
        textColor: "#111827",
        borderRadius: 12,
        data: {
          content: "• Airbnb – \"Stay Like a Local\" global travel campaign\n• Glossier – Product launch for Cloud Paint expansion\n• Away – Seasonal suitcase collection hero talent\n• American Express – Platinum lifestyle series",
          alignment: "left"
        }
      },
      {
        type: "PACKAGES",
        position: 2,
        title: "Sponsorship Packages",
        description: "Custom bundles available on request",
        url: null,
        imageUrl: null,
        backgroundColor: "#ffffff",
        textColor: "#111827",
        borderRadius: 12,
        data: {
          packages: [
            { name: "Launch Buzz", price: "$4,500", deliverables: ["TikTok + IG Reel", "Story Set", "Usage 30 days"] },
            { name: "Momentum Builder", price: "$7,800", deliverables: ["TikTok", "IG Reel", "YouTube mention", "Newsletter feature"] },
            { name: "Full Campaign", price: "Custom", deliverables: ["Multi-platform series", "Paid usage", "In-person activation"] }
          ]
        }
      },
      {
        type: "CONTACT_FORM",
        position: 3,
        title: "Booking & Availability",
        description: "Tell me about your campaign goals and timeline.",
        url: null,
        imageUrl: null,
        backgroundColor: "#f3f4f6",
        textColor: "#374151",
        borderRadius: 12,
        data: {
          fields: [
            { name: "brand", type: "text", required: true, placeholder: "Brand Name" },
            { name: "campaign_budget", type: "select", required: true, placeholder: "Budget Range", options: ["<$5K", "$5K-$10K", "$10K-$25K", "$25K+"] },
            { name: "timeline", type: "text", required: true, placeholder: "Campaign Timeline" },
            { name: "message", type: "textarea", required: true, placeholder: "Campaign Details" }
          ],
          submitButtonText: "Submit Inquiry",
          successMessage: "Thanks! Expect a reply within 24 hours."
        }
      }
    ]
  },

  // Template 12: Coach Authority Hub (Full Page)
  {
    name: "Coach Authority Hub",
    description: "Convert leads with a high-trust coaching page featuring signature frameworks, testimonials, and booking CTA.",
    category: "Coaches",
    industry: "Coaching",
    templateType: "FULL_PAGE" as const,
    tags: ["coach", "consultant", "booking", "authority"],
    featured: true,
    isPublic: true,
    thumbnailUrl: "/templates/coach-authority.png",
    headerData: {
      displayName: "Jordan Blake",
      title: "Executive Leadership Coach",
      company: "Elevate Performance",
      bio: "Former VP @ Salesforce. I help high-growth founders and operators scale themselves alongside their companies.",
      email: "jordan@elevateperformance.co",
      phone: "",
      website: "elevateperformance.co",
      location: "Austin, TX",
      avatar: null,
      backgroundImage: null,
      socialLinks: {
        linkedin: "jordanblake",
        twitter: "heyjordanblake",
        instagram: "",
        youtube: "",
        tiktok: "",
        facebook: "",
        github: ""
      },
      customIntroduction: "🚀 Cohort 7 applications close March 1",
      headerStyle: "card"
    },
    blocksData: [
      {
        type: "TEXT_BLOCK",
        position: 0,
        title: "My Framework",
        description: null,
        url: null,
        imageUrl: null,
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
        borderRadius: 12,
        data: {
          content: "**1. Clarity** – Audit leadership operating system\n**2. Capacity** – Build leverage with systems + delegation\n**3. Communication** – Upgrade executive presence & storytelling\n**4. Culture** – Architect teams that scale with you",
          alignment: "left"
        }
      },
      {
        type: "SOCIAL_PROOF",
        position: 1,
        title: "Client Results",
        description: "Trusted by category leaders",
        url: null,
        imageUrl: null,
        backgroundColor: "#f9fafb",
        textColor: "#111827",
        borderRadius: 12,
        data: {
          testimonials: [
            { quote: "Grew from $8M → $32M ARR in 18 months while hiring my exec bench.", author: "CEO, AI Infrastructure Startup" },
            { quote: "Helped me manage board relationships with confidence.", author: "COO, Fintech Unicorn" },
            { quote: "The most practical leadership system I've ever used.", author: "Founder, Consumer Marketplace" }
          ]
        }
      },
      {
        type: "BOOKING_CALENDAR",
        position: 2,
        title: "Book a Diagnostic Session",
        description: "30 minutes to map your next level. $250 deposit applied to engagement.",
        url: null,
        imageUrl: null,
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
        borderRadius: 12,
        data: {
          calendarLink: "https://calendly.com/jordanblake/diagnostic",
          duration: "30 minutes",
          buttonText: "Schedule Session"
        }
      },
      {
        type: "NEWSLETTER",
        position: 3,
        title: "Leadership Signals",
        description: "Weekly insights for founders and operators.",
        url: null,
        imageUrl: null,
        backgroundColor: "#1f2937",
        textColor: "#ffffff",
        borderRadius: 12,
        data: {
          placeholder: "Work email",
          buttonText: "Join Free",
          successMessage: "You're in! First memo arrives Monday.",
          frequency: "weekly"
        }
      }
    ]
  },

  // Template 13: Course Launch Blueprint (Full Page)
  {
    name: "Course Launch Blueprint",
    description: "High-converting launch page for cohort-based courses with curriculum breakdown and bonuses.",
    category: "Course Creator",
    industry: "Education",
    templateType: "FULL_PAGE" as const,
    tags: ["courses", "launch", "education", "cohort"],
    featured: true,
    isPublic: true,
    thumbnailUrl: "/templates/course-launch-blueprint.png",
    headerData: {
      displayName: "",
      title: "Build Your First $50K Cohort",
      company: "",
      bio: "A proven playbook for creators turning their expertise into transformational learning experiences. Over 1,200 students launched profitable cohorts with this system.",
      email: "",
      phone: "",
      website: "",
      location: "Global",
      avatar: null,
      backgroundImage: null,
      socialLinks: {
        twitter: "cohortblueprint",
        instagram: "",
        youtube: "",
        tiktok: "",
        linkedin: "cohortblueprint",
        facebook: "",
        github: ""
      },
      customIntroduction: "📅 Next cohort begins April 22 • 40 seats only",
      headerStyle: "split"
    },
    blocksData: [
      {
        type: "CURRICULUM",
        position: 0,
        title: "Curriculum Overview",
        description: null,
        url: null,
        imageUrl: null,
        backgroundColor: "#ffffff",
        textColor: "#111827",
        borderRadius: 12,
        data: {
          modules: [
            { name: "Module 1 – Audience Deep Dive", details: "Identify transformation, promise, and MVP offer." },
            { name: "Module 2 – Experience Design", details: "Structure lessons, assignments, and live sessions." },
            { name: "Module 3 – Launch Engine", details: "Email sequences, social proof, and sales calls." },
            { name: "Module 4 – Delivery Systems", details: "Operations, tooling, onboarding, and community." }
          ]
        }
      },
      {
        type: "PROMO",
        position: 1,
        title: "Included Bonuses",
        description: "Enroll before April 12 to unlock:",
        url: null,
        imageUrl: null,
        backgroundColor: "#ecfccb",
        textColor: "#365314",
        borderRadius: 12,
        data: {
          items: [
            "Done-for-you launch email templates",
            "Behind-the-scenes funnel teardown",
            "Private Slack mastermind for 90 days"
          ],
          expiresAt: null
        }
      },
      {
        type: "PRODUCT",
        position: 2,
        title: "Secure Your Seat",
        description: "Flexible payment options available.",
        url: null,
        imageUrl: null,
        backgroundColor: "#1f2937",
        textColor: "#ffffff",
        borderRadius: 16,
        data: {
          productId: null,
          price: 1997,
          currency: "USD",
          ctaText: "Enroll Now",
          originalPrice: 2497
        }
      },
      {
        type: "TEXT_BLOCK",
        position: 3,
        title: "Student Wins",
        description: null,
        url: null,
        imageUrl: null,
        backgroundColor: "#f9fafb",
        textColor: "#111827",
        borderRadius: 12,
        data: {
          content: "“Sold out my very first cohort in 12 days.” – Priya, UX Educator\n“From scattered to scalable. Now running quarterly cohorts.” – Malik, Career Coach\n“Generated $84K on launch week following this playbook.” – Jenna, Creator Educator",
          alignment: "left"
        }
      }
    ]
  },

  // Template 14: Vlogger Episode Hub (Full Page)
  {
    name: "Vlogger Episode Hub",
    description: "Create a destination for binge-worthy video content with playlists, partners, and merch links.",
    category: "Content Creators",
    industry: "Vlogger",
    templateType: "FULL_PAGE" as const,
    tags: ["vlog", "video", "youtube", "creator"],
    featured: true,
    isPublic: true,
    thumbnailUrl: "/templates/vlogger-episode.png",
    headerData: {
      displayName: "Life in Motion",
      title: "Weekly Travel Vlog Series",
      company: "",
      bio: "Follow siblings Tasha & Eli as they chase sunrise missions across 40+ countries. New cinematic vlog every Thursday, plus behind-the-scenes gear drops.",
      email: "",
      phone: "",
      website: "lifeinmotion.tv",
      location: "Worldwide",
      avatar: null,
      backgroundImage: null,
      socialLinks: {
        youtube: "lifeinmotion",
        instagram: "lifeinmotion",
        tiktok: "lifeinmotion",
        twitter: "lifeinmotion",
        linkedin: "",
        facebook: "lifeinmotion",
        github: ""
      },
      customIntroduction: "🎬 Season 5: Arctic Circle Expedition",
      headerStyle: "minimal"
    },
    blocksData: [
      {
        type: "VIDEO_GALLERY",
        position: 0,
        title: "Latest Episodes",
        description: null,
        url: null,
        imageUrl: null,
        backgroundColor: "#ffffff",
        textColor: "#111827",
        borderRadius: 12,
        data: {
          videos: [
            { title: "Episode 71 – Ice Roads & Aurora", url: "https://youtube.com/watch?v=arctic71" },
            { title: "Episode 70 – Dog Sled Diaries", url: "https://youtube.com/watch?v=arctic70" },
            { title: "Episode 69 – Reindeer Camp Cookout", url: "https://youtube.com/watch?v=arctic69" }
          ]
        }
      },
      {
        type: "LINK",
        position: 1,
        title: "🎧 Listen to the Aftershow",
        description: "Uncut stories + guest interviews",
        url: "https://open.spotify.com/show/lifeinmotion",
        imageUrl: null,
        backgroundColor: "#111827",
        textColor: "#ffffff",
        borderRadius: 12,
        data: { icon: "headphones", featured: true }
      },
      {
        type: "LINK",
        position: 2,
        title: "🧭 Shop Travel Essentials",
        description: "Handpicked gear we actually use",
        url: "https://lifeinmotion.tv/gear",
        imageUrl: null,
        backgroundColor: "#f3f4f6",
        textColor: "#111827",
        borderRadius: 12,
        data: { icon: "shopping-bag", featured: false }
      },
      {
        type: "SPONSORSHIP",
        position: 3,
        title: "Partners & Sponsors",
        description: "Collaborating with brands we genuinely trust.",
        url: null,
        imageUrl: null,
        backgroundColor: "#ffffff",
        textColor: "#374151",
        borderRadius: 12,
        data: {
          sponsors: ["Peak Design", "Fjällräven", "Sony Alpha Collective"]
        }
      },
      {
        type: "NEWSLETTER",
        position: 4,
        title: "Field Notes Newsletter",
        description: "Get itineraries, camera setups, and raw clips.",
        url: null,
        imageUrl: null,
        backgroundColor: "#111827",
        textColor: "#ffffff",
        borderRadius: 12,
        data: {
          placeholder: "Email address",
          buttonText: "Get Field Notes",
          successMessage: "Welcome aboard! Expect the next issue on Sunday.",
          frequency: "weekly"
        }
      },
      {
        type: "CONTACT_FORM",
        position: 5,
        title: "Partnership Requests",
        description: "Let’s build cinematic stories together.",
        url: null,
        imageUrl: null,
        backgroundColor: "#f3f4f6",
        textColor: "#1f2937",
        borderRadius: 12,
        data: {
          fields: [
            { name: "brand", type: "text", required: true, placeholder: "Brand / Agency" },
            { name: "campaign_goal", type: "text", required: true, placeholder: "Campaign Goal" },
            { name: "deliverables", type: "textarea", required: true, placeholder: "Deliverables / Ideas" }
          ],
          submitButtonText: "Submit Brief",
          successMessage: "Thanks! We’ll reply within 48 hours."
        }
      }
    ]
  },

  // Template 15: Creator Newsletter Hub (Full Page)
  {
    name: "Creator Newsletter Hub",
    description: "Invite fans to subscribe, binge premium content, and discover signature products in one destination.",
    category: "Creators/Influencers",
    industry: "Creator",
    templateType: "FULL_PAGE" as const,
    tags: ["newsletter", "creator", "community", "monetization"],
    featured: true,
    isPublic: true,
    thumbnailUrl: "/templates/creator-newsletter.png",
    headerData: {
      displayName: "Creator Playbook",
      title: "Weekly Systems for Serious Creators",
      company: "",
      bio: "A private memo for creators scaling from $5K → $25K monthly. SOPs, launch calendars, and experiments that move the metrics.",
      email: "",
      phone: "",
      website: "creatorplaybook.com",
      location: "Remote",
      avatar: null,
      backgroundImage: null,
      socialLinks: {
        twitter: "creatorplaybook",
        instagram: "",
        youtube: "",
        tiktok: "",
        linkedin: "",
        facebook: "",
        github: ""
      },
      customIntroduction: "📝 Subscribers see every workflow + template we ship.",
      headerStyle: "gradient"
    },
    blocksData: [
      {
        type: "NEWSLETTER",
        position: 0,
        title: "Join 38,000+ Creators",
        description: "One systems breakdown every Friday.",
        url: null,
        imageUrl: null,
        backgroundColor: "#1d4ed8",
        textColor: "#ffffff",
        borderRadius: 16,
        data: {
          placeholder: "you@example.com",
          buttonText: "Subscribe Free",
          successMessage: "Welcome! Check your inbox for the welcome kit.",
          frequency: "weekly"
        }
      },
      {
        type: "TEXT_BLOCK",
        position: 1,
        title: "Inside Each Issue",
        description: null,
        url: null,
        imageUrl: null,
        backgroundColor: "#ffffff",
        textColor: "#111827",
        borderRadius: 12,
        data: {
          content: "✅ Dashboard teardown of a top creator business\n✅ Launch calendar template + campaign benchmarks\n✅ Sponsorship pricing tracker + outreach SOP\n✅ Swipe file of funnels, ads, and landing pages",
          alignment: "left"
        }
      },
      {
        type: "PRODUCT",
        position: 2,
        title: "The Creator OS",
        description: "All the Notion dashboards & automations we use internally.",
        url: null,
        imageUrl: null,
        backgroundColor: "#f9fafb",
        textColor: "#111827",
        borderRadius: 12,
        data: {
          productId: null,
          price: 149,
          currency: "USD",
          ctaText: "Get the OS"
        }
      },
      {
        type: "SOCIAL_PROOF",
        position: 3,
        title: "Reader Love",
        description: null,
        url: null,
        imageUrl: null,
        backgroundColor: "#ffffff",
        textColor: "#111827",
        borderRadius: 12,
        data: {
          testimonials: [
            { quote: "This is the only newsletter I read start to finish.", author: "Nate, Creator & Podcaster" },
            { quote: "Every issue has a template I plug into my business.", author: "Lena, Vlogger" },
            { quote: "Feels like being inside an operator’s notebook.", author: "Cam, Course Creator" }
          ]
        }
      }
    ]
  }
];

// ---------------------------------------------
// Template Expansion (30 new creator-focused templates)
// ---------------------------------------------

type PersonaTemplateConfig = {
  name: string;
  description: string;
  category: string;
  industry: string;
  personaName: string;
  personaTitle: string;
  personaCompany?: string;
  heroBio: string;
  callout?: string;
  tags: string[];
  highlightTitle: string;
  highlightContent: string;
  offerings: Array<{
    title: string;
    description: string;
    url: string;
    color: string;
  }>;
  newsletter: {
    title: string;
    description: string;
    placeholder: string;
    buttonText: string;
    successMessage: string;
  };
  testimonials: string[];
  headerStyle?: 'minimal' | 'card' | 'gradient' | 'split';
  thumbnailUrl?: string;
};

const personaTemplateConfigs: PersonaTemplateConfig[] = [
  {
    name: 'Creator Launchpad',
    description: 'Position your social channels, offers, and collaborations from a single conversion hub.',
    category: 'Creators/Influencers',
    industry: 'Content Creator',
    personaName: 'Mika Alvarez',
    personaTitle: 'Lifestyle & Systems Creator',
    heroBio: 'I teach 200K+ creators how to batch, automate, and scale content like a business.',
    callout: '🚀 Enrollment open for Creator OPS cohort',
    tags: ['creator', 'systems', 'ops'],
    highlightTitle: 'Why brands work with me',
    highlightContent: '• Built a 6-figure creator business in 18 months\n• Averaging 8.3% engagement across Reels + TikTok\n• Featured in The Verge and Later Blog for OPS workflows',
    offerings: [
      {
        title: 'Consulting: Creator OS Sprint',
        description: '2-week deep dive to rebuild your content engine',
        url: 'https://creatorlaunchpad.com/sprint',
        color: '#4f46e5'
      },
      {
        title: 'Shop Templates & Dashboards',
        description: 'Swipe my Notion + Airtable systems',
        url: 'https://creatorlaunchpad.com/store',
        color: '#0ea5e9'
      }
    ],
    newsletter: {
      title: 'Weekly OPS Memo',
      description: 'Practical operating tips every Friday.',
      placeholder: 'your@email.com',
      buttonText: 'Join the memo',
      successMessage: 'Welcome aboard! Check your inbox for the starter bundle.'
    },
    testimonials: [
      '“Mika rebuilt our content workflow in 10 days.” – Nova Studios',
      '“My team doubled video output without burning out.” – Jess, Creator-CEO'
    ]
  },
  {
    name: 'Creator Monetization Hub',
    description: 'Highlight premium products, exclusive drops, and partner links in one streamlined view.',
    category: 'Creators/Influencers',
    industry: 'Influencer',
    personaName: 'Kiera Lane',
    personaTitle: 'Creator & Community Architect',
    heroBio: 'From micro-influencer to multi-offer brand. I package community-driven launches.',
    callout: '✨ Limited collab slots for Q3',
    tags: ['monetization', 'community', 'collab'],
    highlightTitle: 'Launch assets & funnels',
    highlightContent: '• Built 12 paid communities for creators 50K–500K\n• $3.2M total GMV across launches\n• Preferred partner for Kajabi + Circle',
    offerings: [
      {
        title: 'Collab Deck & Media Kit',
        description: 'Download my latest numbers + sample activations.',
        url: 'https://kieralane.com/media',
        color: '#ec4899'
      },
      {
        title: 'Creator Revenue OS',
        description: 'Templates, calculators, and sponsor pipeline.',
        url: 'https://kieralane.com/os',
        color: '#f97316'
      }
    ],
    newsletter: {
      title: 'Monetize Mondays',
      description: 'Case studies on creator revenue stacks.',
      placeholder: 'brand@company.com',
      buttonText: 'Subscribe',
      successMessage: 'You’re in! Watch for next Monday’s breakdown.'
    },
    testimonials: [
      '“Kiera engineered our $250K membership launch.” – Studio Kin',
      '“No fluff, just systems that print.” – Max, Creator CFO'
    ],
    headerStyle: 'split'
  },
  {
    name: 'Daily Vlog Portal',
    description: 'Centralize your latest uploads, playlists, and merch for binge-ready fans.',
    category: 'Creators/Influencers',
    industry: 'Vlogger',
    personaName: 'Everett Day',
    personaTitle: 'Travel & Story Vlogger',
    heroBio: 'Documenting slow travel with pro-level storytelling and film-grade looks.',
    callout: '🎬 Season 12: Island overland expedition',
    tags: ['vlog', 'travel', 'cinematic'],
    highlightTitle: 'Watch, listen, and join',
    highlightContent: '• 1.4M subscribers across YouTube + Nebula\n• Documentaries screened in Patagonia & REI stores\n• Partnerships: Sony Alpha, Peak Design, AllTrails',
    offerings: [
      {
        title: 'Latest Episode: Sky-Island Route',
        description: 'Watch the long-form cinematic drop.',
        url: 'https://everettday.tv/latest',
        color: '#2563eb'
      },
      {
        title: 'Gear + Preset Vault',
        description: 'Download LUTs, presets, and packing lists.',
        url: 'https://everettday.tv/vault',
        color: '#1d4ed8'
      }
    ],
    newsletter: {
      title: 'Field Notes',
      description: 'Routes, budgets, and camera rigs—straight from the road.',
      placeholder: 'fan@email.com',
      buttonText: 'Get field notes',
      successMessage: 'Thanks! New notes arrive every Sunday.'
    },
    testimonials: [
      '“Everett’s trip plans are our go-to.” – Trek Provisions',
      '“B-roll looks better than most brand films.” – Alpine Creative'
    ]
  },
  {
    name: 'Streamer Sponsorship Deck',
    description: 'Pitch interactive campaigns with performance stats, packages, and booking CTA.',
    category: 'Creators/Influencers',
    industry: 'Streaming',
    personaName: 'Atlas Rae',
    personaTitle: 'Tech & Variety Streamer',
    heroBio: 'Building immersive live campaigns for product launches and esports orgs.',
    callout: '🎮 1B minutes watched • 70% Gen-Z audience',
    tags: ['streamer', 'gaming', 'sponsorship'],
    highlightTitle: 'Audience snapshot',
    highlightContent: '• 2.3M Twitch subs · 1.1M YT\n• Average concurrent 18,500 viewers\n• 92% chat participation on sponsored segments',
    offerings: [
      {
        title: 'Interactive Launch Streams',
        description: 'Custom mini-games + live product demos.',
        url: 'https://atlasrae.gg/launch',
        color: '#7c3aed'
      },
      {
        title: 'Community Challenges',
        description: 'Gamified campaigns with Discord + mods.',
        url: 'https://atlasrae.gg/challenges',
        color: '#38bdf8'
      }
    ],
    newsletter: {
      title: 'Creator x Brand Sync',
      description: 'Monthly forecast of campaign slots + data.',
      placeholder: 'agency@brand.com',
      buttonText: 'Download media kit',
      successMessage: 'Media kit sent! Check your inbox for metrics.'
    },
    testimonials: [
      '“Highest ROAS of any creator campaign we’ve done.” – Loop Hardware',
      '“Atlas plans like an agency but delivers like a fan.” – Shift Esports'
    ],
    headerStyle: 'card'
  },
  {
    name: 'Podcast Tour One-sheet',
    description: 'Book guest spots with a media-ready one-sheet covering audience, topics, and CTAs.',
    category: 'Creators/Influencers',
    industry: 'Podcast Host',
    personaName: 'Nyla Brooks',
    personaTitle: 'Host, The Signal Podcast',
    personaCompany: 'Signal Media',
    heroBio: 'Weekly conversations on creative businesses—top 50 iTunes careers show.',
    callout: '🎙 500K downloads / month',
    tags: ['podcast', 'media', 'press'],
    highlightTitle: 'Audience + reach',
    highlightContent: '• 62% founders & creative directors\n• 120K newsletter readers\n• Episodes repurposed to YouTube + LinkedIn',
    offerings: [
      {
        title: 'Request an Interview',
        description: 'Pitch yourself or a client for Season 8.',
        url: 'https://thesignal.fm/guest',
        color: '#1f2937'
      },
      {
        title: 'Sponsorship Deck',
        description: 'Download rates + ad formats.',
        url: 'https://thesignal.fm/sponsor',
        color: '#2563eb'
      }
    ],
    newsletter: {
      title: 'Signal Dispatch',
      description: 'Curated creative ops once a week.',
      placeholder: 'you@studio.com',
      buttonText: 'Get the dispatch',
      successMessage: 'Thanks! Expect the next issue on Thursday.'
    },
    testimonials: [
      '“Our episode drove 5K new leads in 48 hours.” – Forma Tools',
      '“Nyla brings journalistic prep to every chat.” – Lydia, VC'
    ]
  },
  {
    name: 'Course Cohort HQ',
    description: 'Showcase curriculum, cohorts, and community perks for modern educators.',
    category: 'Entrepreneurs',
    industry: 'Course Creator',
    personaName: 'Dr. Lila Stone',
    personaTitle: 'Researcher & Community Educator',
    heroBio: 'Helping experts run transformational cohort-based programs.',
    callout: '🎓 Next cohort kicks off July 8',
    tags: ['cohort', 'education', 'curriculum'],
    highlightTitle: 'Inside the learning journey',
    highlightContent: '• Weekly labs + accountability pods\n• Templates, feedback, and lifetime access\n• Alumni community of 1,400+ operators',
    offerings: [
      {
        title: 'Course Overview Deck',
        description: 'See syllabus, outcomes, and timeline.',
        url: 'https://cohorthq.com/deck',
        color: '#0d9488'
      },
      {
        title: 'Apply for Cohort 12',
        description: 'Limited to 80 seats per cohort.',
        url: 'https://cohorthq.com/apply',
        color: '#14b8a6'
      }
    ],
    newsletter: {
      title: 'Learning Lab Notes',
      description: 'Weekly essays on teaching systems.',
      placeholder: 'educator@email.com',
      buttonText: 'Subscribe free',
      successMessage: 'Welcome! Expect your Lab Notes within minutes.'
    },
    testimonials: [
      '“Doubled my cohort revenue while halving chaos.” – Sam, Product Coach',
      '“Lila nails pedagogy + business.” – Ros, UX Professor'
    ],
    headerStyle: 'card'
  },
  {
    name: 'Masterclass Momentum',
    description: 'Promote your signature masterclass with modules, bonuses, and enrollment CTA.',
    category: 'Specialty',
    industry: 'Course Creator',
    personaName: 'Harper Quinn',
    personaTitle: 'Creative Director & Educator',
    heroBio: 'I teach visual storytellers to ship polished work + get paid premium rates.',
    callout: '💡 Masterclass runs quarterly',
    tags: ['masterclass', 'design', 'premium'],
    highlightTitle: 'Program outcomes',
    highlightContent: '• Diagnose style + positioning\n• Build repeatable creative process\n• Package and sell your signature projects',
    offerings: [
      {
        title: 'Join Masterclass Waitlist',
        description: 'Early access pricing + bonuses.',
        url: 'https://harperquinn.com/masterclass',
        color: '#be185d'
      },
      {
        title: 'Download Curriculum Guide',
        description: 'See modules, faculty, and student work.',
        url: 'https://harperquinn.com/guide',
        color: '#db2777'
      }
    ],
    newsletter: {
      title: 'Studio Dispatch',
      description: 'Monthly case studies from alumni.',
      placeholder: 'artist@email.com',
      buttonText: 'Get dispatch',
      successMessage: 'You’re on the list. Next dispatch arrives soon.'
    },
    testimonials: [
      '“Raised my rates 3x while keeping creative joy.” – Sasha, Illustrator',
      '“Harper fuses art + ops in a way nobody else does.” – Milo, Motion Lead'
    ],
    headerStyle: 'gradient'
  },
  {
    name: 'Coach VIP Day',
    description: 'Book premium intensives with a page dedicated to agenda, outcomes, and bonuses.',
    category: 'Coaches',
    industry: 'Coach/Mentor',
    personaName: 'Ezra Blake',
    personaTitle: 'Leadership Coach & Facilitator',
    heroBio: 'Helping exec teams reset operating rhythms in a single high-impact day.',
    callout: '🧠 VIP Days available monthly',
    tags: ['coach', 'vip', 'leadership'],
    highlightTitle: 'The VIP Day blueprint',
    highlightContent: '• Diagnose team bottlenecks\n• Facilitate decision sprint\n• Leave with 90-day operating plan',
    offerings: [
      {
        title: 'Reserve a VIP Day',
        description: 'Apply for an on-site or remote intensive.',
        url: 'https://ezrablake.com/vip',
        color: '#7c3aed'
      },
      {
        title: 'Executive Playbook',
        description: 'Download the prep workbook + sample agenda.',
        url: 'https://ezrablake.com/playbook',
        color: '#6d28d9'
      }
    ],
    newsletter: {
      title: 'Leadership Pulse',
      description: 'Signals, prompts, and exercises twice per month.',
      placeholder: 'ceo@company.com',
      buttonText: 'Join pulse',
      successMessage: 'Pulse subscribed! Expect the next note Friday.'
    },
    testimonials: [
      '“We made three strategic decisions before lunch.” – Horizon Labs CEO',
      '“Ezra blends therapy-level listening with ruthless focus.” – COO, Fintech'
    ]
  },
  {
    name: 'Coaching Group Funnel',
    description: 'Warm leads into your group coaching container with curriculum and social proof.',
    category: 'Coaches',
    industry: 'Coach/Mentor',
    personaName: 'Rayna Fields',
    personaTitle: 'Career Transition Coach',
    heroBio: 'I help mid-career pros pivot into creative tech roles with confidence.',
    callout: '🌱 Group cohort forming now',
    tags: ['group coaching', 'career shift', 'community'],
    highlightTitle: 'What you’ll build inside',
    highlightContent: '• 8-week career sprint\n• Weekly office hours + peer pods\n• Hiring manager reviews + referral network',
    offerings: [
      {
        title: 'Apply to the Group',
        description: 'Share your goals and timeline.',
        url: 'https://raynafields.com/apply',
        color: '#0ea5e9'
      },
      {
        title: 'Watch Info Session',
        description: 'On-demand walkthrough of curriculum.',
        url: 'https://raynafields.com/info',
        color: '#0284c7'
      }
    ],
    newsletter: {
      title: 'Career Pivot Letter',
      description: 'Weekly prompt & job market insights.',
      placeholder: 'you@workmail.com',
      buttonText: 'Send me the letter',
      successMessage: 'Letter enlisted! Check your inbox soon.'
    },
    testimonials: [
      '“Signed a new role in 6 weeks.” – Pri, Product Ops',
      '“Community + structure I desperately needed.” – Jen, Brand Strategist'
    ],
    headerStyle: 'card'
  },
  {
    name: 'Wellness Retreat Landing',
    description: 'Sell immersive retreats with itinerary, pricing, and past guest stories.',
    category: 'Events/Organizations',
    industry: 'Wellness',
    personaName: 'Selene Hart',
    personaTitle: 'Founder, Wild Bloom Retreats',
    personaCompany: 'Wild Bloom',
    heroBio: 'Curating deep reset experiences for founders & creatives in nature.',
    callout: '🌿 Summer retreat: Dolomites, Italy',
    tags: ['retreat', 'wellness', 'travel'],
    highlightTitle: 'Retreat experience',
    highlightContent: '• 5 days, 14 guests, private chef\n• Breathwork, creative lab, hiking\n• Integration plan & accountability circle',
    offerings: [
      {
        title: 'Reserve Your Spot',
        description: 'Submit application + deposit.',
        url: 'https://wildbloom.co/apply',
        color: '#16a34a'
      },
      {
        title: 'Download Retreat Guide',
        description: 'See itinerary, accommodations, pricing.',
        url: 'https://wildbloom.co/guide',
        color: '#15803d'
      }
    ],
    newsletter: {
      title: 'Wild Notes',
      description: 'Seasonal rituals + retreat openings.',
      placeholder: 'name@email.com',
      buttonText: 'Join Wild Notes',
      successMessage: 'Welcome—your first Wild Note arrives in a few days.'
    },
    testimonials: [
      '“Felt safe enough to fully unplug.” – Mara, Founder',
      '“Integration support was unmatched.” – Dav, CTO'
    ],
    headerStyle: 'gradient'
  },
  {
    name: 'Fitness Challenge Hub',
    description: 'Launch viral fitness challenges with prizes, schedules, and lead capture.',
    category: 'Specialty',
    industry: 'Fitness',
    personaName: 'Coach Darius',
    personaTitle: 'Performance Coach & Trainer',
    heroBio: 'Helping busy pros build athletic routines through 28-day hybrid challenges.',
    callout: '🏅 Upcoming: Summer Strength Sprint',
    tags: ['fitness', 'challenge', 'community'],
    highlightTitle: 'Challenge details',
    highlightContent: '• 4 weeks of progressive programming\n• Live accountability + leaderboard\n• Cash + gear prizes for top finishers',
    offerings: [
      {
        title: 'Join the Challenge',
        description: 'Secure your spot + welcome kit.',
        url: 'https://coachdarius.com/challenge',
        color: '#f97316'
      },
      {
        title: 'Get Meal Plan',
        description: 'Download the macro-friendly meal plan.',
        url: 'https://coachdarius.com/mealplan',
        color: '#ea580c'
      }
    ],
    newsletter: {
      title: 'Performance Playbook',
      description: 'Training cues delivered weekly.',
      placeholder: 'athlete@email.com',
      buttonText: 'Get playbook',
      successMessage: 'Welcome to the squad! Playbook sends every Monday.'
    },
    testimonials: [
      '“Lost 6% body fat while traveling.” – Kris, VP Sales',
      '“Most motivating challenge yet.” – Ana, Designer'
    ]
  },
  {
    name: 'SaaS Founder Waitlist',
    description: 'Collect waitlist leads for a SaaS beta with roadmap, sneak peeks, and offers.',
    category: 'Entrepreneurs',
    industry: 'SaaS Founder',
    personaName: 'Theo Park',
    personaTitle: 'Founder & Product Lead',
    heroBio: 'Building Flowstate—an async project ops OS for hybrid teams.',
    callout: '🧪 Private beta live now',
    tags: ['saas', 'beta', 'product'],
    highlightTitle: 'Why teams switch',
    highlightContent: '• Single dashboard for rituals + comms\n• Async sprint reviews baked in\n• AI summarizing updates across tools',
    offerings: [
      {
        title: 'Join Beta Waitlist',
        description: 'Get onboarding slot + discount.',
        url: 'https://flowstate.app/join',
        color: '#0ea5e9'
      },
      {
        title: 'See Product Tour',
        description: '5-min video walkthrough.',
        url: 'https://flowstate.app/tour',
        color: '#0369a1'
      }
    ],
    newsletter: {
      title: 'Build Log',
      description: 'Monthly shipping notes for curious teams.',
      placeholder: 'founder@email.com',
      buttonText: 'Follow build log',
      successMessage: 'Subscribed! Latest build log arriving soon.'
    },
    testimonials: [
      '“Finally replaced 4 internal spreadsheets.” – Ops Lead, Vanta',
      '“Async standups that actually stick.” – CTO, Launchpad'
    ],
    headerStyle: 'minimal'
  },
  {
    name: 'Agency Snapshot',
    description: 'Pitch your marketing or creative agency with stats, services, and proof.',
    category: 'Business/Professional',
    industry: 'Agency',
    personaName: 'Summit North Agency',
    personaTitle: 'Performance Studio for B2B SaaS',
    heroBio: 'Full-funnel growth sprints for $2M–$20M ARR companies.',
    callout: '📈 $58M pipeline influenced in 2024',
    tags: ['agency', 'b2b', 'growth'],
    highlightTitle: 'How we work',
    highlightContent: '• 90-day experiments\n• Creative + ops under one roof\n• Weekly metrics cockpit',
    offerings: [
      {
        title: 'View Case Studies',
        description: 'Read 4 client breakdowns.',
        url: 'https://summitnorth.co/cases',
        color: '#1d4ed8'
      },
      {
        title: 'Book Strategy Call',
        description: '30-minute audit + action plan.',
        url: 'https://summitnorth.co/call',
        color: '#1e40af'
      }
    ],
    newsletter: {
      title: 'Pipeline Signals',
      description: 'Bi-weekly growth experiments.',
      placeholder: 'ops@company.com',
      buttonText: 'Get signals',
      successMessage: 'Signal confirmed! Next email goes out Tuesday.'
    },
    testimonials: [
      '“20% lift in demo volume in 6 weeks.” – VP Growth, Atlas',
      '“Feels like an in-house team.” – CEO, QueryStack'
    ]
  },
  {
    name: 'Freelancer Story',
    description: 'Convert inbound leads for your freelance studio with services and social proof.',
    category: 'Business/Professional',
    industry: 'Freelance',
    personaName: 'June Avery',
    personaTitle: 'Product Copywriter & Strategist',
    heroBio: 'I help SaaS products sound sharp, clear, and human.',
    callout: '📝 Booking Q2 retainers',
    tags: ['freelance', 'copywriting', 'saas'],
    highlightTitle: 'What I deliver',
    highlightContent: '• Product messaging systems\n• Web + onboarding copy\n• Sales enablement decks',
    offerings: [
      {
        title: 'Request Proposal',
        description: 'Share scope + timeline.',
        url: 'https://juneavery.co/proposal',
        color: '#f97316'
      },
      {
        title: 'See Work Samples',
        description: 'Recent launches and voice guides.',
        url: 'https://juneavery.co/work',
        color: '#ea580c'
      }
    ],
    newsletter: {
      title: 'Sharp Notes',
      description: 'Monthly copy riffs + prompts.',
      placeholder: 'hello@email.com',
      buttonText: 'Send me notes',
      successMessage: 'Notes incoming! Check your inbox soon.'
    },
    testimonials: [
      '“Ship-ready copy in half the time.” – Polywave PMM',
      '“June made our app feel approachable.” – Raised Labs'
    ],
    headerStyle: 'card'
  },
  {
    name: 'Speaker Media Kit',
    description: 'Secure speaking gigs with topics, past stages, and booking CTA.',
    category: 'Business/Professional',
    industry: 'Speaker',
    personaName: 'Leo Martinez',
    personaTitle: 'Keynote Speaker & Moderator',
    heroBio: 'I help audiences rethink creative risk and experimentation.',
    callout: '🎤 Booking 2025 conference season',
    tags: ['speaker', 'media', 'events'],
    highlightTitle: 'Signature talks',
    highlightContent: '• Prototyping the Future\n• Culture of Creative Experiments\n• Building Brave Teams',
    offerings: [
      {
        title: 'Download Speaker Deck',
        description: 'Topics, requirements, and fees.',
        url: 'https://leomartinez.com/deck',
        color: '#22d3ee'
      },
      {
        title: 'Book Leo',
        description: 'Inquire about keynotes or moderation.',
        url: 'https://leomartinez.com/book',
        color: '#0ea5e9'
      }
    ],
    newsletter: {
      title: 'Stage Notes',
      description: 'Quarterly thoughts on storytelling.',
      placeholder: 'producer@email.com',
      buttonText: 'Get stage notes',
      successMessage: 'Thanks! Latest stage notes heading your way.'
    },
    testimonials: [
      '“Standing ovation two years in a row.” – Elevate Summit',
      '“Leo moderates like a late-night host.” – Global Forum'
    ],
    headerStyle: 'split'
  },
  {
    name: 'Author Launch Room',
    description: 'Home base for your upcoming book—including bonuses, tour stops, and lead gen.',
    category: 'Specialty',
    industry: 'Author',
    personaName: 'Quinn Harper',
    personaTitle: 'Author & Researcher',
    heroBio: 'Writing about the industrial imagination—how creators reshape systems.',
    callout: '📚 New book drops September 10',
    tags: ['author', 'book launch', 'bonuses'],
    highlightTitle: 'About the book',
    highlightContent: '• 5-year research project across 8 countries\n• Case studies: design, tech, civic labs\n• Foreword by Debbie Millman',
    offerings: [
      {
        title: 'Preorder + Claim Bonuses',
        description: 'Get toolkit, interviews, and workshop.',
        url: 'https://quinnharper.com/book',
        color: '#f59e0b'
      },
      {
        title: 'Tour Schedule',
        description: 'See city stops + virtual launches.',
        url: 'https://quinnharper.com/tour',
        color: '#d97706'
      }
    ],
    newsletter: {
      title: 'Launch Dispatch',
      description: 'Behind-the-scenes research + book gossip.',
      placeholder: 'reader@email.com',
      buttonText: 'Get dispatch',
      successMessage: 'Thanks! Dispatch will arrive soon.'
    },
    testimonials: [
      '“Quinn is the thinker we need right now.” – Roxane Gay',
      '“Deep reporting with poetic writing.” – Wired'
    ]
  },
  {
    name: 'Nonprofit Impact Hub',
    description: 'Share programs, outcomes, and donor actions for your nonprofit.',
    category: 'Events/Organizations',
    industry: 'Non-profit',
    personaName: 'Neighbor Roots Collective',
    personaTitle: 'Community Nonprofit',
    heroBio: 'We grow food, teach youth, and build climate resilience in our city.',
    callout: '🌱 Raised 40K volunteer hours in 2024',
    tags: ['nonprofit', 'impact', 'donate'],
    highlightTitle: 'Impact snapshot',
    highlightContent: '• 12 urban farms supported\n• 2,500 youth in after-school labs\n• 18 micro-grants to neighborhood leaders',
    offerings: [
      {
        title: 'Donate Monthly',
        description: 'Fund gardens, educators, and grants.',
        url: 'https://neighborroots.org/donate',
        color: '#16a34a'
      },
      {
        title: 'Volunteer Sign-up',
        description: 'Join garden builds & harvest parties.',
        url: 'https://neighborroots.org/volunteer',
        color: '#15803d'
      }
    ],
    newsletter: {
      title: 'Field Journal',
      description: 'Monthly impact stories + events.',
      placeholder: 'neighbor@email.com',
      buttonText: 'Join Field Journal',
      successMessage: 'Thanks! We’ll see you in the next Field Journal.'
    },
    testimonials: [
      '“They make community-led change real.” – Local Council',
      '“Kids leave empowered + fed.” – Parent volunteer'
    ]
  },
  {
    name: 'Community Membership Portal',
    description: 'Pitch your paid community with pillars, events, and onboarding roadmap.',
    category: 'Events/Organizations',
    industry: 'Community',
    personaName: 'Forge Collective',
    personaTitle: 'Membership for Indie Makers',
    heroBio: 'A private home for makers shipping ambitious side projects.',
    callout: '🧱 Membership reopen date: Oct 1',
    tags: ['community', 'membership', 'makers'],
    highlightTitle: 'What members get',
    highlightContent: '• Weekly build rooms + feedback\n• Expert mentor office hours\n• Access to job board + partnership pool',
    offerings: [
      {
        title: 'Join the Waitlist',
        description: 'We open 100 spots per quarter.',
        url: 'https://forgecollective.com/join',
        color: '#ea580c'
      },
      {
        title: 'Member Handbook',
        description: 'Understand norms and curriculum.',
        url: 'https://forgecollective.com/handbook',
        color: '#9a3412'
      }
    ],
    newsletter: {
      title: 'Builder Broadcast',
      description: 'Monthly highlights from the community.',
      placeholder: 'maker@email.com',
      buttonText: 'Get broadcast',
      successMessage: 'Broadcast inbound! Watch for the next release.'
    },
    testimonials: [
      '“The most focused maker space I’ve tried.” – Dev, Indie Hacker',
      '“My accountability crew lives here.” – Cass, Product Designer'
    ]
  },
  {
    name: 'Photography Booking Desk',
    description: 'Convert leads with packages, galleries, and booking CTA for photographers.',
    category: 'Artists/Creatives',
    industry: 'Photographer',
    personaName: 'Nova Ellis',
    personaTitle: 'Brand + Editorial Photographer',
    heroBio: 'Crafting cinematic stills and motion for timeless brands.',
    callout: '📷 Booking FW25 campaigns',
    tags: ['photography', 'editorial', 'booking'],
    highlightTitle: 'Signature experience',
    highlightContent: '• Full-service art direction\n• Hybrid stills + motion\n• Delivery in 10 business days',
    offerings: [
      {
        title: 'Request Proposal',
        description: 'Share mood board + launch timeline.',
        url: 'https://novaellis.studio/request',
        color: '#db2777'
      },
      {
        title: 'View Portfolio',
        description: 'Recent campaigns + lookbooks.',
        url: 'https://novaellis.studio/work',
        color: '#be185d'
      }
    ],
    newsletter: {
      title: 'Creative Proofsheet',
      description: 'Monthly behind-the-scenes drops.',
      placeholder: 'brand@email.com',
      buttonText: 'Get proofsheet',
      successMessage: 'Proofsheet coming up! Check your inbox soon.'
    },
    testimonials: [
      '“Nova’s eye elevated our entire rebrand.” – Oak & Pine',
      '“Efficient, tasteful, wildly collaborative.” – Leonora Atelier'
    ]
  },
  {
    name: 'Music Release Hub',
    description: 'Promote singles, EPs, and merch with playlists, tour dates, and presaves.',
    category: 'Artists/Creatives',
    industry: 'Musician',
    personaName: 'Nova Pulse',
    personaTitle: 'Electronic Music Artist',
    heroBio: 'Analog textures + future bass moods. Featured on NTS, Boiler Room, and COLORS.',
    callout: '🎧 New EP “Solar Bloom” drops May 19',
    tags: ['music', 'release', 'tour'],
    highlightTitle: 'Listen & connect',
    highlightContent: '• 2M monthly streams\n• Global fanbase across Spotify + SoundCloud\n• Limited vinyl + merch drops for each era',
    offerings: [
      {
        title: 'Presave Solar Bloom',
        description: 'Unlock private listening party.',
        url: 'https://novapulse.fm/presave',
        color: '#fb7185'
      },
      {
        title: 'Tour Tickets',
        description: 'Grab your spot on the Night Circuit tour.',
        url: 'https://novapulse.fm/tour',
        color: '#f87171'
      }
    ],
    newsletter: {
      title: 'Signal Chain',
      description: 'Monthly studio diaries + stems.',
      placeholder: 'fan@email.com',
      buttonText: 'Join signal',
      successMessage: 'Signal received. Expect stems soon!'
    },
    testimonials: [
      '“Nova is the future of cinematic electronic.” – Mixmag',
      '“Impossible not to move.” – Resident Advisor'
    ]
  },
  {
    name: 'Artist Commission Gallery',
    description: 'Showcase commission process, pricing tiers, and waitlist for artists.',
    category: 'Artists/Creatives',
    industry: 'Artist',
    personaName: 'Elodie Grant',
    personaTitle: 'Fine Artist & Illustrator',
    heroBio: 'I create large-scale botanical murals and archival prints for bold interiors.',
    callout: '🎨 Commission calendar open for Q4',
    tags: ['artist', 'commissions', 'gallery'],
    highlightTitle: 'Commission experience',
    highlightContent: '• Virtual concept session\n• Hand-painted or digital options\n• Framing + installation support',
    offerings: [
      {
        title: 'Submit Commission Inquiry',
        description: 'Tell me about your space + story.',
        url: 'https://elodiegrant.art/commission',
        color: '#c084fc'
      },
      {
        title: 'Shop Limited Prints',
        description: '16x20 archival series.',
        url: 'https://elodiegrant.art/shop',
        color: '#a855f7'
      }
    ],
    newsletter: {
      title: 'Studio Bloom',
      description: 'Monthly progress shots + print drops.',
      placeholder: 'collector@email.com',
      buttonText: 'Join studio bloom',
      successMessage: 'Thank you! Next Studio Bloom update arrives soon.'
    },
    testimonials: [
      '“Captured our story in color.” – Rivera family',
      '“Clients walk in and gasp.” – Atelier Co-working'
    ]
  },
  {
    name: 'Digital Product Shelf',
    description: 'Stack your e-books, templates, and bundles with one-click checkout links.',
    category: 'Entrepreneurs',
    industry: 'Digital Products',
    personaName: 'Cam Wilder',
    personaTitle: 'Creator & Framework Architect',
    heroBio: 'I build plug-and-play systems for creators and solo founders.',
    callout: '🛒 40K customers served',
    tags: ['digital products', 'templates', 'creator'],
    highlightTitle: 'Top products',
    highlightContent: '• Launch Playbook 2.0\n• Paid Community OS\n• Creator CRM Kit',
    offerings: [
      {
        title: 'Browse Product Shelf',
        description: 'Bundles for every growth stage.',
        url: 'https://camwilder.com/shop',
        color: '#22c55e'
      },
      {
        title: 'License for Teams',
        description: 'Bring plug-ins to your whole org.',
        url: 'https://camwilder.com/license',
        color: '#16a34a'
      }
    ],
    newsletter: {
      title: 'Shelf Updates',
      description: 'New drops + changelogs every two weeks.',
      placeholder: 'ops@email.com',
      buttonText: 'Send updates',
      successMessage: 'Shelf updates locked in!'
    },
    testimonials: [
      '“Saved me 40 hours per launch.” – Jade, Creator',
      '“Best templates on the market.” – Cole, Agency Founder'
    ]
  },
  {
    name: 'Webinar Conversion Studio',
    description: 'Drive registrations and replays for your webinar series.',
    category: 'Specialty',
    industry: 'Marketing',
    personaName: 'Strata Labs',
    personaTitle: 'Webinar & Event Studio',
    heroBio: 'We run weekly teach-ins for modern operators.',
    callout: '🎥 Upcoming: Automation Ops Summit',
    tags: ['webinar', 'events', 'marketing'],
    highlightTitle: 'Why attend',
    highlightContent: '• Actionable frameworks\n• Downloadable toolkits\n• Live product labs + Q&A',
    offerings: [
      {
        title: 'Save Your Seat',
        description: 'Register for the next live session.',
        url: 'https://stratalabs.com/register',
        color: '#f43f5e'
      },
      {
        title: 'Watch Replays',
        description: 'Binge past sessions + notes.',
        url: 'https://stratalabs.com/replay',
        color: '#e11d48'
      }
    ],
    newsletter: {
      title: 'Conversion Signals',
      description: 'Session recaps + swipe files.',
      placeholder: 'marketer@email.com',
      buttonText: 'Send signals',
      successMessage: 'You’re on the list! Signals send Wednesday.'
    },
    testimonials: [
      '“Most useful webinars we’ve attended.” – Growth Guild',
      '“Tangible playbooks every time.” – Drift Ops Lead'
    ]
  },
  {
    name: 'Summit Speaker Showcase',
    description: 'Highlight speakers, agenda, and sponsors for your upcoming summit.',
    category: 'Events/Organizations',
    industry: 'Conference',
    personaName: 'Future Craft Summit',
    personaTitle: 'Creative Tech Conference',
    heroBio: 'Two days of talks, labs, and installations about creative technology.',
    callout: '🏙 Live in Chicago • Nov 7-8',
    tags: ['summit', 'conference', 'speakers'],
    highlightTitle: 'Featured sessions',
    highlightContent: '• AI storytelling lab\n• Immersive retail showcase\n• Systems thinking for makers',
    offerings: [
      {
        title: 'Buy Summit Pass',
        description: 'Early bird pricing until Aug 1.',
        url: 'https://futurecraft.io/pass',
        color: '#4f46e5'
      },
      {
        title: 'Download Speaker Guide',
        description: 'Full agenda + workshop list.',
        url: 'https://futurecraft.io/guide',
        color: '#4338ca'
      }
    ],
    newsletter: {
      title: 'Future Drops',
      description: 'Speaker reveals + installation previews.',
      placeholder: 'you@email.com',
      buttonText: 'Get future drops',
      successMessage: 'Future Drops confirmed. See you soon!'
    },
    testimonials: [
      '“The only event that feels like a creative sprint.” – Attendee 2024',
      '“Balanced inspiration + practicality.” – Sponsor, Artifex'
    ]
  },
  {
    name: 'Food Blogger Kitchen',
    description: 'Share recipes, sponsors, and email opt-ins for culinary creators.',
    category: 'Creators/Influencers',
    industry: 'Food Blogger',
    personaName: 'Lena Hearts Food',
    personaTitle: 'Chef & Storyteller',
    heroBio: 'Plant-forward comfort food with a Filipino flair.',
    callout: '🍲 Cookbook Vol. 2 preorders open',
    tags: ['food', 'recipes', 'cookbook'],
    highlightTitle: 'Kitchen staples',
    highlightContent: '• Free weekly meal plan\n• Seasonal ingredient guides\n• Partnered cooking classes',
    offerings: [
      {
        title: 'Download Meal Plan',
        description: 'PDF with grocery list + prep tips.',
        url: 'https://lenaheartsfood.com/mealplan',
        color: '#facc15'
      },
      {
        title: 'Join Live Class',
        description: 'Cook along with Lena this weekend.',
        url: 'https://lenaheartsfood.com/class',
        color: '#f59e0b'
      }
    ],
    newsletter: {
      title: 'Pantry Letter',
      description: 'Personal essays + recipes on Sundays.',
      placeholder: 'foodie@email.com',
      buttonText: 'Send pantry letter',
      successMessage: 'Yum! Pantry Letter sending soon.'
    },
    testimonials: [
      '“My family eats better thanks to Lena.” – Reader',
      '“Partnerships feel authentic + delicious.” – Pantry Partner'
    ]
  },
  {
    name: 'Travel Creator Studio',
    description: 'Host itineraries, brand collabs, and trip planning services.',
    category: 'Creators/Influencers',
    industry: 'Travel Creator',
    personaName: 'Atlas & Aria',
    personaTitle: 'Slow Travel Storytellers',
    heroBio: 'We craft cinematic travel stories and trip frameworks for mindful explorers.',
    callout: '✈️ Booking 2025 brand residencies',
    tags: ['travel', 'creator', 'storytelling'],
    highlightTitle: 'Partner with us',
    highlightContent: '• Documentary-grade visuals\n• Travel playbooks + guides\n• 1M+ monthly audience',
    offerings: [
      {
        title: 'Hire for Campaign',
        description: 'Request concept + mood board.',
        url: 'https://atlasaria.com/campaign',
        color: '#38bdf8'
      },
      {
        title: 'Download Travel Guide',
        description: 'City-by-city itineraries.',
        url: 'https://atlasaria.com/guides',
        color: '#0ea5e9'
      }
    ],
    newsletter: {
      title: 'Layover Letter',
      description: 'Route insights + photography tips monthly.',
      placeholder: 'traveler@email.com',
      buttonText: 'Get layover letter',
      successMessage: 'Bon voyage! Layover Letter en route.'
    },
    testimonials: [
      '“Our best-performing tourism campaign.” – Visit Spain',
      '“They think like directors + strategists.” – Wander Co.'
    ]
  },
  {
    name: 'Beauty Drop Lookbook',
    description: 'Launch cosmetics or beauty drops with swatches, tutorials, and VIP access.',
    category: 'Specialty',
    industry: 'Beauty Creator',
    personaName: 'Muse Lab Beauty',
    personaTitle: 'Indie Beauty Brand',
    heroBio: 'Inclusive, science-backed skincare drops sold in curated capsules.',
    callout: '💄 Capsule 07 launches April 1',
    tags: ['beauty', 'drops', 'skincare'],
    highlightTitle: 'What’s inside Capsule 07',
    highlightContent: '• Cloud Dew Serum\n• Lightform SPF Stick\n• Prism Finish Tint trio',
    offerings: [
      {
        title: 'Join VIP List',
        description: 'Early access + limited bundle.',
        url: 'https://muselabskin.com/vip',
        color: '#ec4899'
      },
      {
        title: 'Watch Tutorial',
        description: 'See application & formula science.',
        url: 'https://muselabskin.com/tutorial',
        color: '#db2777'
      }
    ],
    newsletter: {
      title: 'Lab Notes',
      description: 'Formula breakdowns + skin rituals.',
      placeholder: 'skin@email.com',
      buttonText: 'Get lab notes',
      successMessage: 'Skin intel incoming!'
    },
    testimonials: [
      '“My skin barrier never felt better.” – Customer review',
      '“Muse Lab sells out every drop.” – Beauty Editor'
    ]
  },
  {
    name: 'Finance Educator HQ',
    description: 'Teach money systems with modules, calculators, and community upsells.',
    category: 'Entrepreneurs',
    industry: 'Finance Educator',
    personaName: 'Morgan True',
    personaTitle: 'Financial Educator & Analyst',
    heroBio: 'I make wealth building approachable for first-gen professionals.',
    callout: '💸 Course enrollment closes June 1',
    tags: ['finance', 'education', 'wealth'],
    highlightTitle: 'Curriculum pillars',
    highlightContent: '• Money systems audit\n• Investing for cash flow\n• Recession proofing your income',
    offerings: [
      {
        title: 'Join Wealth Circuit',
        description: '8-week guided coaching.',
        url: 'https://morgantrue.com/wealth',
        color: '#22d3ee'
      },
      {
        title: 'Download Finance Toolkit',
        description: 'Spreadsheets + automations.',
        url: 'https://morgantrue.com/toolkit',
        color: '#14b8a6'
      }
    ],
    newsletter: {
      title: 'Money Signals',
      description: 'Weekly note on cashflow + investing.',
      placeholder: 'you@email.com',
      buttonText: 'Send money signals',
      successMessage: 'Signals activated. Next issue Monday.'
    },
    testimonials: [
      '“Hit my first 100K net worth.” – Student',
      '“Morgan simplifies complex moves.” – Community member'
    ],
    headerStyle: 'card'
  },
  {
    name: 'Tech Educator Lab',
    description: 'Build authority as a tech educator with labs, office hours, and resources.',
    category: 'Entrepreneurs',
    industry: 'Tech Educator',
    personaName: 'Devon Cade',
    personaTitle: 'Engineer & Educator',
    heroBio: 'Teaching practical AI and automation skills to busy teams.',
    callout: '🤖 New lab: Automations for Ops',
    tags: ['tech', 'education', 'automation'],
    highlightTitle: 'Lab format',
    highlightContent: '• Live coding labs\n• Office hours + project clinics\n• Templates + code snippets',
    offerings: [
      {
        title: 'Enroll in Lab',
        description: 'Seats limited to 50 builders.',
        url: 'https://devoncade.com/lab',
        color: '#3b82f6'
      },
      {
        title: 'Corporate Workshops',
        description: 'Bring the lab to your org.',
        url: 'https://devoncade.com/workshops',
        color: '#1d4ed8'
      }
    ],
    newsletter: {
      title: 'Builder Bits',
      description: 'Automation tactics every Thursday.',
      placeholder: 'engineer@email.com',
      buttonText: 'Get builder bits',
      successMessage: 'Bits will drop in your inbox shortly.'
    },
    testimonials: [
      '“Devon demystified AI for our ops team.” – COO, Alloy',
      '“The labs are insanely practical.” – Student'
    ]
  },
  {
    name: 'Yoga Studio Hub',
    description: 'Market your yoga studio with class packs, retreats, and memberships.',
    category: 'Specialty',
    industry: 'Wellness',
    personaName: 'Luma Yoga Loft',
    personaTitle: 'Boutique Yoga Studio',
    heroBio: 'Modern yoga, somatics, and breathwork in a sunlight studio.',
    callout: '🧘 New moon series starts next month',
    tags: ['yoga', 'studio', 'membership'],
    highlightTitle: 'What we offer',
    highlightContent: '• Daily flows + restorative classes\n• Small-group teacher trainings\n• Retreats + community events',
    offerings: [
      {
        title: 'Grab Class Pack',
        description: '10 classes + virtual library.',
        url: 'https://lumayoga.co/classpack',
        color: '#14b8a6'
      },
      {
        title: 'Join Retreat',
        description: 'Fall equinox retreat in Mexico.',
        url: 'https://lumayoga.co/retreat',
        color: '#0f766e'
      }
    ],
    newsletter: {
      title: 'Luma Letters',
      description: 'Monthly rituals + studio news.',
      placeholder: 'member@email.com',
      buttonText: 'Receive Luma letters',
      successMessage: 'Namaste! Luma Letters heading your way.'
    },
    testimonials: [
      '“Best studio energy in the city.” – Member',
      '“Instruction is thoughtful and inclusive.” – Kay'
    ],
    headerStyle: 'gradient'
  }
];

function buildPersonaTemplate(config: PersonaTemplateConfig) {
  const testimonialContent = config.testimonials.map((quote) => `• ${quote}`).join('\n');

  const blocks = [
    {
      type: 'TEXT_BLOCK',
      position: 0,
      title: config.highlightTitle,
      description: null,
      url: null,
      imageUrl: null,
      backgroundColor: '#ffffff',
      textColor: '#111827',
      borderRadius: 12,
      data: {
        content: config.highlightContent,
        alignment: 'left'
      }
    },
    ...config.offerings.map((offer, index) => ({
      type: 'LINK',
      position: index + 1,
      title: offer.title,
      description: offer.description,
      url: offer.url,
      imageUrl: null,
      backgroundColor: offer.color,
      textColor: '#ffffff',
      borderRadius: 12,
      data: {
        icon: 'zap',
        featured: index === 0
      }
    })),
    {
      type: 'TEXT_BLOCK',
      position: config.offerings.length + 1,
      title: 'Testimonials',
      description: null,
      url: null,
      imageUrl: null,
      backgroundColor: '#f3f4f6',
      textColor: '#111827',
      borderRadius: 12,
      data: {
        content: testimonialContent,
        alignment: 'left'
      }
    },
    {
      type: 'EMAIL_CAPTURE',
      position: config.offerings.length + 2,
      title: config.newsletter.title,
      description: config.newsletter.description,
      url: null,
      imageUrl: null,
      backgroundColor: '#eef2ff',
      textColor: '#312e81',
      borderRadius: 12,
      data: {
        placeholder: config.newsletter.placeholder,
        buttonText: config.newsletter.buttonText,
        successMessage: config.newsletter.successMessage,
        formId: null
      }
    }
  ];

  return {
    name: config.name,
    description: config.description,
    category: config.category,
    industry: config.industry,
    tags: config.tags,
    templateType: 'FULL_PAGE' as const,
    featured: false,
    isPublic: true,
    thumbnailUrl: config.thumbnailUrl ?? '/templates/custom-template.png',
    headerData: {
      displayName: config.personaName,
      title: config.personaTitle,
      company: config.personaCompany ?? '',
      bio: config.heroBio,
      customIntroduction: config.callout ?? '',
      headerStyle: config.headerStyle ?? 'gradient'
    },
    blocksData: blocks
  };
}

const personaTemplates = personaTemplateConfigs.map((config) => {
  // Enrich headerData to conform to expected type (fill missing fields)
  const persona = buildPersonaTemplate(config);
  return {
    ...persona,
    headerData: {
      ...persona.headerData,
      email: '',
      phone: '',
      website: '',
      location: '',
      avatar: null,
      backgroundImage: null,
      socialLinks: {
        twitter: '',
        linkedin: '',
        facebook: '',
        instagram: '',
        youtube: '',
        tiktok: '',
        github: ''
      }
    }
  } as any;
});
templates.push(...personaTemplates);

async function main() {
  console.log('🌱 Seeding page templates...');

  for (const template of templates) {
    const created = await prisma.pageTemplate.create({
      data: {
        ...template,
        userId: null // System templates have no owner
      }
    });
    console.log(`✅ Created template: ${created.name} (${created.templateType})`);
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log(`📊 Created ${templates.length} templates`);
  console.log(`   - ${templates.filter(t => t.templateType === 'BIO_ONLY').length} Bio Only templates`);
  console.log(`   - ${templates.filter(t => t.templateType === 'FULL_PAGE').length} Full Page templates`);
}
try {
 truncateTable('page_template');
  main()
    .catch((e) => {
      console.error('❌ Error seeding templates:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
} catch (error) {
  console.error('Error truncating table:', error);
}

  async function truncateTable(tableName: string) {
    try {
      // Note: Use $executeRawUnsafe for dynamic table names
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);
      console.log(`Table "${tableName}" truncated successfully.`);
    } catch (error) {
      console.error(`Error truncating table "${tableName}":`, error);
    }
  }