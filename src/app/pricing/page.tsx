"use client";
import { useState } from "react";
import { Check, Star, Zap, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import "./pricing.scss";

const pricingPlans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    icon: Star,
    color: "var(--text-secondary)",
    features: [
      "Up to 10 file conversions per day",
      "Basic file formats (PDF, JPG, PNG)",
      "File size limit: 10MB",
      "Standard conversion speed",
      "Basic support"
    ],
    limitations: [
      "Limited to 10 conversions daily",
      "No priority processing",
      "Basic file formats only"
    ],
    popular: false
  },
  {
    id: "plus",
    name: "Plus",
    price: "$9.99",
    period: "per month",
    description: "For power users and professionals",
    icon: Zap,
    color: "var(--accent-primary)",
    features: [
      "Unlimited file conversions",
      "All file formats (200+ formats)",
      "File size limit: 100MB",
      "Priority processing",
      "Advanced conversion options",
      "Email support",
      "No watermarks",
      "Batch processing (up to 50 files)"
    ],
    limitations: [],
    popular: true
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19.99",
    period: "per month",
    description: "For teams and businesses",
    icon: Crown,
    color: "#FF6B35",
    features: [
      "Everything in Plus",
      "File size limit: 1GB",
      "API access",
      "Custom integrations",
      "Priority support (24/7)",
      "Team collaboration",
      "Advanced analytics",
      "White-label options",
      "Custom branding",
      "SLA guarantee"
    ],
    limitations: [],
    popular: false
  }
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const getDiscountedPrice = (price: string) => {
    if (!isAnnual) return price;
    const numPrice = parseFloat(price.replace('$', ''));
    const discounted = numPrice * 10; // 10 months for annual
    return `$${discounted.toFixed(2)}`;
  };

  const getAnnualSavings = (price: string) => {
    const numPrice = parseFloat(price.replace('$', ''));
    const savings = numPrice * 2; // 2 months free
    return `Save $${savings.toFixed(2)}`;
  };

  return (
    <div className="pricing-container">
      {/* Background decorations */}
      <div className="bg-decoration bg-decoration-1" />
      <div className="bg-decoration bg-decoration-2" />
      <div className="bg-decoration bg-decoration-3" />
      
      <div className="pricing-content">
        {/* Header */}
        <div className="pricing-header">
          <h1 className="pricing-title">
            Choose Your Perfect Plan
          </h1>
          <p className="pricing-subtitle">
            Unlock the full potential of our file conversion platform
          </p>
          
          {/* Billing Toggle */}
          <div className="billing-toggle">
            <span className={!isAnnual ? "active" : ""}>Monthly</span>
            <button
              className={`toggle-switch ${isAnnual ? "annual" : "monthly"}`}
              onClick={() => setIsAnnual(!isAnnual)}
            >
              <div className="toggle-slider" />
            </button>
            <span className={isAnnual ? "active" : ""}>
              Annual
              {isAnnual && <span className="savings-badge">Save 20%</span>}
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="pricing-grid">
          {pricingPlans.map((plan) => {
            const IconComponent = plan.icon;
            const isPopular = plan.popular;
            
            return (
              <Card
                key={plan.id}
                className={`pricing-card ${isPopular ? "popular" : ""}`}
                style={{
                  background: isPopular 
                    ? 'linear-gradient(135deg, var(--bg-glass-card) 0%, rgba(0, 122, 255, 0.1) 100%)'
                    : 'var(--bg-glass-card)',
                  border: isPopular 
                    ? '2px solid var(--accent-primary)'
                    : '1px solid var(--border-glass)',
                  position: 'relative'
                }}
              >
                {isPopular && (
                  <div className="popular-badge">
                    <Star size={16} />
                    Most Popular
                  </div>
                )}
                
                <CardHeader className="pricing-card-header">
                  <div className="plan-icon" style={{ color: plan.color }}>
                    <IconComponent size={32} />
                  </div>
                  <CardTitle className="plan-name">{plan.name}</CardTitle>
                  <div className="plan-description">{plan.description}</div>
                  
                  <div className="plan-pricing">
                    <span className="price">
                      {getDiscountedPrice(plan.price)}
                    </span>
                    <span className="period">
                      {isAnnual ? "per year" : plan.period}
                    </span>
                    {isAnnual && plan.price !== "$0" && (
                      <div className="annual-savings">
                        {getAnnualSavings(plan.price)}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pricing-card-content">
                  <div className="plan-features">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="feature-item">
                        <Check size={16} className="feature-check" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations.length > 0 && (
                    <div className="plan-limitations">
                      <h4>Limitations:</h4>
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="limitation-item">
                          <span>{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    className={`plan-button ${isPopular ? "popular" : ""}`}
                    style={{
                      background: isPopular 
                        ? 'var(--accent-primary)'
                        : 'var(--bg-glass-card)',
                      color: isPopular 
                        ? 'white'
                        : 'var(--text-primary)',
                      border: isPopular 
                        ? 'none'
                        : '1px solid var(--border-glass)',
                      width: '100%',
                      marginTop: '24px',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '16px'
                    }}
                  >
                    {plan.id === "free" ? "Get Started Free" : "Choose Plan"}
                    <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="pricing-faq">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>Can I change my plan anytime?</h3>
              <p>Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="faq-item">
              <h3>What payment methods do you accept?</h3>
              <p>We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
            </div>
            <div className="faq-item">
              <h3>Is there a free trial?</h3>
              <p>Yes, all paid plans come with a 14-day free trial. No credit card required.</p>
            </div>
            <div className="faq-item">
              <h3>Do you offer refunds?</h3>
              <p>We offer a 30-day money-back guarantee for all paid plans.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="pricing-cta">
          <h2>Ready to get started?</h2>
          <p>Join thousands of users who trust our platform for their file conversion needs.</p>
          <Button
            style={{
              background: 'var(--accent-primary)',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600'
            }}
          >
            Start Free Trial
            <ArrowRight size={20} style={{ marginLeft: '12px' }} />
          </Button>
        </div>
      </div>
    </div>
  );
}
