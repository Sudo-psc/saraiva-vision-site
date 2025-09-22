// WordPress GraphQL queries for different content types

// Fragment for common post fields
export const POST_FIELDS = `
  fragment PostFields on Post {
    id
    databaseId
    title
    slug
    excerpt
    content
    date
    modified
    status
    featuredImage {
      node {
        id
        sourceUrl
        altText
        mediaDetails {
          width
          height
        }
      }
    }
    author {
      node {
        id
        name
        slug
        avatar {
          url
        }
      }
    }
    categories {
      nodes {
        id
        name
        slug
      }
    }
    tags {
      nodes {
        id
        name
        slug
      }
    }
    seo {
      title
      metaDesc
      focuskw
      metaKeywords
      metaRobotsNoindex
      metaRobotsNofollow
      opengraphTitle
      opengraphDescription
      opengraphImage {
        sourceUrl
      }
      twitterTitle
      twitterDescription
      twitterImage {
        sourceUrl
      }
    }
  }
`;

// Fragment for common page fields
export const PAGE_FIELDS = `
  fragment PageFields on Page {
    id
    databaseId
    title
    slug
    content
    date
    modified
    status
    featuredImage {
      node {
        id
        sourceUrl
        altText
        mediaDetails {
          width
          height
        }
      }
    }
    parent {
      node {
        id
        slug
        title
      }
    }
    children {
      nodes {
        id
        slug
        title
      }
    }
    seo {
      title
      metaDesc
      focuskw
      metaKeywords
      metaRobotsNoindex
      metaRobotsNofollow
      opengraphTitle
      opengraphDescription
      opengraphImage {
        sourceUrl
      }
      twitterTitle
      twitterDescription
      twitterImage {
        sourceUrl
      }
    }
  }
`;

// Fragment for service custom post type
export const SERVICE_FIELDS = `
  fragment ServiceFields on Service {
    id
    databaseId
    title
    slug
    content
    excerpt
    date
    modified
    status
    featuredImage {
      node {
        id
        sourceUrl
        altText
        mediaDetails {
          width
          height
        }
      }
    }
    serviceDetails {
      duration
      preparation
      recovery
      price
      category
      isPopular
      benefits
      risks
      aftercare
    }
    seo {
      title
      metaDesc
      focuskw
      metaKeywords
      metaRobotsNoindex
      metaRobotsNofollow
      opengraphTitle
      opengraphDescription
      opengraphImage {
        sourceUrl
      }
    }
  }
`;

// Fragment for team member custom post type
export const TEAM_MEMBER_FIELDS = `
  fragment TeamMemberFields on TeamMember {
    id
    databaseId
    title
    slug
    content
    excerpt
    date
    modified
    status
    featuredImage {
      node {
        id
        sourceUrl
        altText
        mediaDetails {
          width
          height
        }
      }
    }
    memberDetails {
      position
      specializations
      certifications
      experience
      education
      languages
      consultationTypes
      availability
    }
    seo {
      title
      metaDesc
      focuskw
      metaKeywords
    }
  }
`;

// Fragment for testimonial custom post type
export const TESTIMONIAL_FIELDS = `
  fragment TestimonialFields on Testimonial {
    id
    databaseId
    title
    slug
    content
    excerpt
    date
    modified
    status
    featuredImage {
      node {
        id
        sourceUrl
        altText
        mediaDetails {
          width
          height
        }
      }
    }
    testimonialDetails {
      patientName
      patientAge
      patientLocation
      rating
      treatmentType
      treatmentDate
      isVerified
      showOnHomepage
    }
  }
`;

// Query to get all posts with pagination
export const GET_ALL_POSTS = `
  ${POST_FIELDS}
  query GetAllPosts($first: Int = 10, $after: String) {
    posts(first: $first, after: $after, where: { status: PUBLISH }) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        ...PostFields
      }
    }
  }
`;

// Query to get a single post by slug
export const GET_POST_BY_SLUG = `
  ${POST_FIELDS}
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      ...PostFields
    }
  }
`;

// Query to get all pages
export const GET_ALL_PAGES = `
  ${PAGE_FIELDS}
  query GetAllPages($first: Int = 100) {
    pages(first: $first, where: { status: PUBLISH }) {
      nodes {
        ...PageFields
      }
    }
  }
`;

// Query to get a single page by slug
export const GET_PAGE_BY_SLUG = `
  ${PAGE_FIELDS}
  query GetPageBySlug($slug: ID!) {
    page(id: $slug, idType: URI) {
      ...PageFields
    }
  }
`;

// Query to get all services
export const GET_ALL_SERVICES = `
  ${SERVICE_FIELDS}
  query GetAllServices($first: Int = 50) {
    services(first: $first, where: { status: PUBLISH }) {
      nodes {
        ...ServiceFields
      }
    }
  }
`;

// Query to get a single service by slug
export const GET_SERVICE_BY_SLUG = `
  ${SERVICE_FIELDS}
  query GetServiceBySlug($slug: ID!) {
    service(id: $slug, idType: SLUG) {
      ...ServiceFields
    }
  }
`;

// Query to get popular services for homepage
export const GET_POPULAR_SERVICES = `
  ${SERVICE_FIELDS}
  query GetPopularServices($first: Int = 6) {
    services(
      first: $first, 
      where: { 
        status: PUBLISH,
        metaQuery: {
          metaArray: [
            {
              key: "is_popular",
              value: "1",
              compare: EQUAL
            }
          ]
        }
      }
    ) {
      nodes {
        ...ServiceFields
      }
    }
  }
`;

// Query to get all team members
export const GET_ALL_TEAM_MEMBERS = `
  ${TEAM_MEMBER_FIELDS}
  query GetAllTeamMembers($first: Int = 20) {
    teamMembers(first: $first, where: { status: PUBLISH }) {
      nodes {
        ...TeamMemberFields
      }
    }
  }
`;

// Query to get a single team member by slug
export const GET_TEAM_MEMBER_BY_SLUG = `
  ${TEAM_MEMBER_FIELDS}
  query GetTeamMemberBySlug($slug: ID!) {
    teamMember(id: $slug, idType: SLUG) {
      ...TeamMemberFields
    }
  }
`;

// Query to get featured testimonials for homepage
export const GET_FEATURED_TESTIMONIALS = `
  ${TESTIMONIAL_FIELDS}
  query GetFeaturedTestimonials($first: Int = 6) {
    testimonials(
      first: $first,
      where: { 
        status: PUBLISH,
        metaQuery: {
          metaArray: [
            {
              key: "show_on_homepage",
              value: "1",
              compare: EQUAL
            }
          ]
        }
      }
    ) {
      nodes {
        ...TestimonialFields
      }
    }
  }
`;

// Query to get all testimonials
export const GET_ALL_TESTIMONIALS = `
  ${TESTIMONIAL_FIELDS}
  query GetAllTestimonials($first: Int = 50) {
    testimonials(first: $first, where: { status: PUBLISH }) {
      nodes {
        ...TestimonialFields
      }
    }
  }
`;

// Query to get recent posts for homepage/blog preview
export const GET_RECENT_POSTS = `
  ${POST_FIELDS}
  query GetRecentPosts($first: Int = 3) {
    posts(first: $first, where: { status: PUBLISH }) {
      nodes {
        ...PostFields
      }
    }
  }
`;

// Query to get site settings and general information
export const GET_SITE_SETTINGS = `
  query GetSiteSettings {
    generalSettings {
      title
      description
      url
      language
      timezone
    }
    allSettings {
      generalSettingsDateFormat
      generalSettingsTimeFormat
      generalSettingsStartOfWeek
    }
  }
`;

// Query to get navigation menus
export const GET_NAVIGATION_MENUS = `
  query GetNavigationMenus {
    menus {
      nodes {
        id
        name
        slug
        locations
        menuItems {
          nodes {
            id
            label
            url
            target
            cssClasses
            description
            parentId
            order
          }
        }
      }
    }
  }
`;