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
        github: "",
        custom: []
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
        github: "jchen",
        custom: []
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
        custom: [{name: "Behance", url: "behance.net/mayarod"}]
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
            {title: "Brand Identity for EcoLife", description: "Complete rebranding including logo, colors, and visual system", imageUrl: null, projectUrl: "https://behance.net/example1", tags: ["branding", "identity"]},
            {title: "Mobile App UI for Fitness+", description: "User interface design for health and wellness app", imageUrl: null, projectUrl: "https://behance.net/example2", tags: ["ui design", "mobile"]},
            {title: "Illustration Series: Urban Stories", description: "Digital illustration collection exploring city life", imageUrl: null, projectUrl: "https://behance.net/example3", tags: ["illustration", "digital art"]},
            {title: "Website Design for StartupX", description: "Modern landing page with interactive elements", imageUrl: null, projectUrl: "https://behance.net/example4", tags: ["web design", "ui/ux"]}
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
        data: {style: "line", thickness: 1}
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
            {name: "name", type: "text", required: true, placeholder: "Your Name"},
            {name: "email", type: "email", required: true, placeholder: "Your Email"},
            {name: "project_type", type: "select", required: true, placeholder: "Project Type", options: ["Branding", "Web Design", "Illustration", "Other"]},
            {name: "message", type: "textarea", required: true, placeholder: "Tell me about your project"}
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
        custom: []
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
        data: {icon: "youtube", featured: true}
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
        data: {icon: "calendar", featured: false}
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
        data: {icon: "download", featured: false}
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
        data: {icon: "shopping-bag", featured: false}
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
        data: {icon: "message-circle", featured: false}
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
        custom: []
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
        data: {style: "line", thickness: 1}
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
        custom: []
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
        custom: [{name: "Medium", url: "medium.com/@davidpark"}]
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
        custom: []
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
        data: {style: "dots", thickness: 2}
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
        custom: []
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
        data: {icon: "bar-chart", featured: true}
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
        type: "EMAIL_CAPTURE",
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
            {name: "company", type: "text", required: true, placeholder: "Company Name"},
            {name: "email", type: "email", required: true, placeholder: "Work Email"},
            {name: "revenue", type: "select", required: true, placeholder: "Annual Revenue", options: ["$0-$1M", "$1M-$5M", "$5M-$10M", "$10M+"]},
            {name: "goals", type: "textarea", required: true, placeholder: "What are your growth goals?"}
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
        custom: []
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
        type: "divider",
        position: 2,
        title: "",
        description: null,
        url: null,
        imageUrl: null,
        backgroundColor: "#e5e7eb",
        textColor: "#9ca3af",
        borderRadius: 0,
        data: {style: "line", thickness: 1}
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
        data: {icon: "book-open", featured: false}
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
  }
];

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

main()
  .catch((e) => {
    console.error('❌ Error seeding templates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
