// Website Navigation
// This file contains the navigation structure for the website

// Definitions for navigation items and social links
interface NavItem {
  label: string;
  path: string;
  ariaLabel?: string;
  icon?: string;
}

interface FooterNavItem {
  label: string;
  path: string;
  ariaLabel?: string;
  icon?: string;
}

interface SocialItem {
  icon: string;
  label: string;
  path: string;
  ariaLabel?: string;
}

// Main navigation items
const mainLinks: NavItem[] = [
  // {
  //   label: "Home",
  //   path: "/#",
  //   ariaLabel: "Go to Home",
  // },
  {
    label: "About",
    path: "/#about",
    ariaLabel: "Learn more about me",
  },
  {
    label: "Contact",
    path: "/#contact",
    ariaLabel: "Contact me",
  },
  {
    label: "Fan Art",
    path: "/fan-art",
    ariaLabel: "View fan art",
  },
];

// Footer navigation links
const footerLinks: FooterNavItem[] = [
  {
    label: "Home",
    path: "/#",
    ariaLabel: "Go to Home",
  },
  {
    label: "About",
    path: "/#about",
    ariaLabel: "Learn more about me",
  },
  {
    label: "Contact",
    path: "/#contact",
    ariaLabel: "Contact me",
  },
  {
    label: "Fan Art",
    path: "/fan-art",
    ariaLabel: "View fan art",
  },
];

// Footer social links (@lucide/astro icons)
const socialLinks: SocialItem[] = [
  {
    label: "Youtube",
    path: "https://www.youtube.com/@ctrlaltcookie",
    icon: "youtube",
    ariaLabel: "View my Youtube channel",
  },
  {
    label: "Twitch",
    path: "https://www.twitch.tv/ctrlaltcookie",
    icon: "twitch",
    ariaLabel: "Watch me live on Twitch",
  },
  // {
  //   label: "Discord",
  //   path: "https://behance.net/austinspillman",
  //   icon: "behance",
  //   ariaLabel: "Join my Discord server",
  // },
  {
    label: "Bluesky",
    path: "https://bsky.app/profile/ctrlaltcookie.com",
    icon: "bluesky",
    ariaLabel: "Connect with me on Bluesky",
  },
];

// Export an object with all navigation-related data
export const navigation = {
  main: mainLinks,
  footer: footerLinks,
  social: socialLinks,
};

// Utility function to check if a path is active
export function isActive(path: string, currentPath: string): boolean {
  if (path === "/") {
    return currentPath === "/";
  }
  return currentPath.startsWith(path);
}

// Export types for external use
export type { NavItem, FooterNavItem, SocialItem };
