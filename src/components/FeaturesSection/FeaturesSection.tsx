"use client";
import { 
  RefreshCw, 
  Cloud, 
  CheckCircle, 
  Globe, 
  Monitor, 
  Shield 
} from "lucide-react";
import "./FeaturesSection.scss";

const features = [
  {
    id: 1,
    title: "300+ formats supported",
    description: "We support more than 25600 different conversions between more than 300 different file formats. More than any other converter.",
    icon: RefreshCw,
  },
  {
    id: 2,
    title: "In the cloud",
    description: "All conversions take place in the cloud which is why it doesn't slow down your phone or computer.",
    icon: Cloud,
  },
  {
    id: 3,
    title: "Easy to use",
    description: "The interface is really intuitive, it doesn't even require any presentation conversion knowledge.",
    icon: CheckCircle,
  },
  {
    id: 4,
    title: "Access from anywhere",
    description: "The tool works online right in your favorite browser: Chrome, Firefox, Safari, etc. There is no need to download anything to your device.",
    icon: Globe,
  },
  {
    id: 5,
    title: "Works on any device",
    description: "Convertio works on any device and operating system: Mac, Linux, Windows, iPhone, Android. No installation is required.",
    icon: Monitor,
  },
  {
    id: 6,
    title: "Secure tool",
    description: "We don't store your files for more than 24 hours after which we permanently delete them from our servers — only you have access to them the whole time. Read more about security.",
    icon: Shield,
  },
];

export default function FeaturesSection() {
  return (
    <section className="features-section">
      <div className="features-container">
        <div className="features-grid">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div key={feature.id} className="feature-card">
                <div className="feature-icon">
                  <IconComponent size={24} />
                </div>
                <div className="feature-content">
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
