import React from 'react';
import Link from 'next/link';
import { Space } from 'antd';
import {
  GithubOutlined,
  TwitterOutlined,
  LinkedinOutlined,
} from '@ant-design/icons';
import './Footer.scss';

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-sections">
          <div className="footer-section">
            <h3>Converters</h3>
            <ul>
              <li><Link href="/audio-converter">Audio Converter</Link></li>
              <li><Link href="/video-converter">Video Converter</Link></li>
              <li><Link href="/image-converter">Image Converter</Link></li>
              <li><Link href="/document-converter">Document Converter</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>More Tools</h3>
            <ul>
              <li><Link href="/archive-converter">Archive Converter</Link></li>
              <li><Link href="/presentation-converter">Presentation Converter</Link></li>
              <li><Link href="/font-converter">Font Converter</Link></li>
              <li><Link href="/ebook-converter">Ebook Converter</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Company</h3>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Support</h3>
            <ul>
              <li><Link href="/help">Help Center</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/blog">Blog</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            © {new Date().getFullYear()} FileConverter. All rights reserved.
          </div>
          <Space size="large" className="social-links">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <GithubOutlined />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <TwitterOutlined />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <LinkedinOutlined />
            </a>
          </Space>
        </div>
      </div>
    </footer>
  );
}






