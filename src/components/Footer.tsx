"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Twitter, Linkedin, Github } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-background border-t py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Mercy</h3>
            <p className="text-muted-foreground text-sm">
              Secure, fast and global cryptocurrency payments platform for businesses and individuals.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition">Contact</Link></li>
              <li><Link href="/careers" className="text-sm text-muted-foreground hover:text-primary transition">Careers</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition">Blog</Link></li>
              <li><Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition">FAQ</Link></li>
              <li><Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition">Help Center</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Connect</h3>
            <div className="flex space-x-4 mb-4">
              <a href="https://twitter.com" className="text-muted-foreground hover:text-primary transition" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" className="text-muted-foreground hover:text-primary transition" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" className="text-muted-foreground hover:text-primary transition" target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://github.com" className="text-muted-foreground hover:text-primary transition" target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Mercy. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 