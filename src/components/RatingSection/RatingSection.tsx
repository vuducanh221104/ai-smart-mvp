"use client";
import { Star } from "lucide-react";
import "./RatingSection.scss";

export default function RatingSection() {
  const rating = 4.6;
  const totalVotes = 28746888;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <section className="rating-section">
      <div className="rating-container">
        <div className="rating-content">
          <h3 className="rating-title">Overall conversion quality rating</h3>
          
          <div className="rating-display">
            <div className="stars-container">
              {[...Array(5)].map((_, index) => {
                if (index < fullStars) {
                  return (
                    <Star 
                      key={index} 
                      className="star star-filled" 
                      size={20} 
                      fill="currentColor"
                    />
                  );
                } else if (index === fullStars && hasHalfStar) {
                  return (
                    <div key={index} className="star-half-container">
                      <Star 
                        className="star star-half" 
                        size={20} 
                        fill="currentColor"
                      />
                    </div>
                  );
                } else {
                  return (
                    <Star 
                      key={index} 
                      className="star star-empty" 
                      size={20} 
                    />
                  );
                }
              })}
            </div>
            
            <div className="rating-info">
              <span className="rating-number">{rating}</span>
              <span className="rating-votes">({totalVotes.toLocaleString()} votes)</span>
            </div>
          </div>
          
          <p className="rating-message">
            You need to convert and download at least 1 file to provide feedback!
          </p>
        </div>
      </div>
    </section>
  );
}
