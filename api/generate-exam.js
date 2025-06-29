const { GoogleGenerativeAI } = require('@google/generative-ai');

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = "Generate a complete English placement test for a CEFR evaluation, ranging from A1 to B2 levels. The test must be in a valid JSON format according to the provided schema. It must include exactly: 10 grammar questions, 10 proofreading questions (where the user identifies the error), 2 different reading comprehension passages with 3 multiple-choice questions each, 1 listening comprehension text (a short story of about 150 words) with 5 multiple-choice questions, and one essay prompt. All content must be in English.";
    const schema = {
        type: "OBJECT",
        properties: {
            grammar: { type: "ARRAY", items: { type: "OBJECT", properties: { question: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } }, answer: { type: "STRING" } } } },
            proofreading: { type: "ARRAY", items: { type: "OBJECT", properties: { question: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } }, answer: { type: "STRING" } } } },
            reading: { type: "ARRAY", items: { type: "OBJECT", properties: { text: { type: "STRING" }, sub_questions: { type: "ARRAY", items: { type: "OBJECT", properties: { question: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } }, answer: { type: "STRING" } } } } } } },
            listening: { type: "OBJECT", properties: { text: { type: "STRING" }, sub_questions: { type: "ARRAY", items: { type: "OBJECT", properties: { question: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } }, answer: { type: "STRING" } } } } } },
            writing: { type: "OBJECT", properties: { question: { type: "STRING" } } }
        }
    };

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json", response_schema: schema },
    });

    const generatedJson = JSON.parse(result.response.text());
    
    response.status(200).json(generatedJson);

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    response.status(500).json({ error: 'Failed to generate exam questions' });
  }
}
