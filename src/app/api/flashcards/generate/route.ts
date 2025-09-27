import { NextRequest, NextResponse } from 'next/server';

// Fallback flashcards generator
function generateFallbackFlashcards(topic: string, count: number) {
  const fallbackTemplates = {
    'summer': [
      { question: "What season comes after spring?", answer: "Summer" },
      { question: "What is the hottest season of the year?", answer: "Summer" },
      { question: "What do people often do at the beach in summer?", answer: "Swim, sunbathe, and play beach games" },
      { question: "What fruit is commonly associated with summer?", answer: "Watermelon" },
      { question: "What do people wear in summer to stay cool?", answer: "Light clothes, shorts, and sandals" },
      { question: "What is a popular summer activity?", answer: "Going on vacation or camping" },
      { question: "What happens to days in summer?", answer: "Days are longer and nights are shorter" },
      { question: "What do people often eat in summer?", answer: "Ice cream and cold drinks" },
      { question: "What sport is popular in summer?", answer: "Baseball, swimming, and tennis" },
      { question: "What do people do to protect themselves from the sun?", answer: "Wear sunscreen and hats" }
    ],
    'default': [
      { question: `What is ${topic}?`, answer: `${topic} is an important concept to learn about.` },
      { question: `Why is ${topic} important?`, answer: `Understanding ${topic} helps in many areas of life.` },
      { question: `How does ${topic} work?`, answer: `${topic} works through various mechanisms and processes.` },
      { question: `What are the benefits of ${topic}?`, answer: `${topic} provides many advantages and benefits.` },
      { question: `What are examples of ${topic}?`, answer: `There are many examples of ${topic} in daily life.` }
    ]
  };

  const templates = fallbackTemplates[topic.toLowerCase() as keyof typeof fallbackTemplates] || fallbackTemplates.default;
  
  // Return the requested number of flashcards, cycling through templates if needed
  const flashcards = [];
  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    flashcards.push({
      question: template.question,
      answer: template.answer
    });
  }
  
  return flashcards;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, language, count } = await request.json();

    if (!prompt || !language || !count) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, language, count' },
        { status: 400 }
      );
    }

    // Validate count
    const flashcardCount = parseInt(count);
    if (flashcardCount < 1 || flashcardCount > 40) {
      return NextResponse.json(
        { error: 'Count must be between 1 and 40' },
        { status: 400 }
      );
    }

    // Prepare the prompt for Gemini AI
    const geminiPrompt = `Generate ${flashcardCount} flashcards about "${prompt}" in ${language}. 
    
    Format each flashcard as JSON with this exact structure:
    {
      "question": "Your question here",
      "answer": "Your answer here"
    }
    
    Return only a valid JSON array of flashcards, no additional text or formatting. Each flashcard should be educational and relevant to the topic "${prompt}".`;

    // Check if API key exists, if not use fallback
    if (!process.env.GEMINI_API_KEY) {
      console.log('GEMINI_API_KEY is not set, using fallback flashcards');
      
      // Generate fallback flashcards
      const fallbackFlashcards = generateFallbackFlashcards(prompt, flashcardCount);
      
      return NextResponse.json({
        success: true,
        flashcards: fallbackFlashcards,
        metadata: {
          topic: prompt,
          language: language,
          count: fallbackFlashcards.length,
          generatedAt: new Date().toISOString(),
          source: 'fallback'
        }
      });
    }

    // Get model from environment variable or use default
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    
    console.log('Using Gemini model:', model);
    console.log('Calling Gemini API with prompt:', geminiPrompt.substring(0, 100) + '...');
    
    // Call Gemini AI API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: geminiPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    console.log('Gemini API response status:', geminiResponse.status);

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      
      // If API fails, use fallback flashcards
      console.log('Gemini API failed, using fallback flashcards');
      const fallbackFlashcards = generateFallbackFlashcards(prompt, flashcardCount);
      
      return NextResponse.json({
        success: true,
        flashcards: fallbackFlashcards,
        metadata: {
          topic: prompt,
          language: language,
          count: fallbackFlashcards.length,
          generatedAt: new Date().toISOString(),
          source: 'fallback',
          error: `AI service temporarily unavailable: ${geminiResponse.status}`
        }
      });
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini API response data:', JSON.stringify(geminiData, null, 2));
    
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error('No generated text in response:', geminiData);
      return NextResponse.json(
        { error: 'No content generated from AI' },
        { status: 500 }
      );
    }

    console.log('Generated text:', generatedText);

    // Parse the generated JSON
    let flashcards;
    try {
      // Clean the response text to extract JSON
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        // Try to parse the entire text as JSON
        flashcards = JSON.parse(generatedText);
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Generated text:', generatedText);
      
      // Fallback: try to create flashcards from text
      try {
        const lines = generatedText.split('\n').filter((line: string) => line.trim());
        flashcards = [];
        
        for (let i = 0; i < lines.length; i += 2) {
          if (i + 1 < lines.length) {
            const question = lines[i].replace(/^[Qq]uestion[:\s]*/, '').trim();
            const answer = lines[i + 1].replace(/^[Aa]nswer[:\s]*/, '').trim();
            
            if (question && answer) {
              flashcards.push({ question, answer });
            }
          }
        }
        
        if (flashcards.length === 0) {
          throw new Error('Could not parse any flashcards from response');
        }
      } catch (fallbackError) {
        console.error('Fallback parsing also failed:', fallbackError);
        return NextResponse.json(
          { error: 'Failed to parse AI response. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Validate flashcards structure
    if (!Array.isArray(flashcards)) {
      return NextResponse.json(
        { error: 'Invalid flashcards format' },
        { status: 500 }
      );
    }

    // Validate each flashcard
    for (const card of flashcards) {
      if (!card.question || !card.answer) {
        return NextResponse.json(
          { error: 'Invalid flashcard structure' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      flashcards: flashcards,
      metadata: {
        topic: prompt,
        language: language,
        count: flashcards.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Flashcard generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
