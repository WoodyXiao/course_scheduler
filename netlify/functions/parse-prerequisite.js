/**
 * Netlify Serverless Function - AI Prerequisite Parser
 * Using Google Gemini REST API (Free)
 * 
 * Endpoint: /.netlify/functions/parse-prerequisite
 * 
 * 直接使用 REST API，避免 SDK 版本问题
 */

const fetch = require('node-fetch');

// System prompt for prerequisite parsing
const SYSTEM_PROMPT = `You are a course prerequisite parser for Simon Fraser University.

Your task: Convert natural language prerequisite descriptions into a structured JSON tree.

Output format (STRICT JSON ONLY):
{
  "name": "ROOT" or course code,
  "condition": "AND" | "OR" | "",
  "children": [
    {
      "name": "CMPT 225",
      "condition": "",
      "children": []
    }
  ]
}

Parsing Rules:
1. Course codes: Extract as "DEPT NUM" format (e.g., "CMPT 225", "MATH 152")
2. Logic operators:
   - "and", "both" → AND node
   - "or", "either" → OR node
   - Comma-separated lists (e.g., "A, B, C") → OR node unless "and" is explicit
3. Parentheses → nested children
4. IGNORE and DO NOT include in tree:
   - Grade requirements ("with a minimum grade of C-")
   - Unit requirements ("30 units", "completion of 60 units")
   - Permissions ("permission of the department")
   - Recommendations ("Recommended: X")
   - Corequisites (these are separate from prerequisites)
   - GPA/CGPA requirements
5. INCLUDE in tree:
   - All course codes (university courses like "CMPT 225", "MATH 152")
   - High school courses (like "BC Math 12", "Grade 12 English")
   - Transfer credits (like "equivalent of CMPT 120")

Examples:

Input: "CMPT 225 and MATH 232, both with a minimum grade of C-."
Output:
{
  "name": "AND",
  "condition": "AND",
  "children": [
    {"name": "CMPT 225", "condition": "", "children": []},
    {"name": "MATH 232", "condition": "", "children": []}
  ]
}

Input: "CMPT 125 or CMPT 126 or CMPT 128"
Output:
{
  "name": "OR",
  "condition": "OR",
  "children": [
    {"name": "CMPT 125", "condition": "", "children": []},
    {"name": "CMPT 126", "condition": "", "children": []},
    {"name": "CMPT 128", "condition": "", "children": []}
  ]
}

Input: "(CMPT 125 or CMPT 126) and MATH 152"
Output:
{
  "name": "AND",
  "condition": "AND",
  "children": [
    {
      "name": "OR",
      "condition": "OR",
      "children": [
        {"name": "CMPT 125", "condition": "", "children": []},
        {"name": "CMPT 126", "condition": "", "children": []}
      ]
    },
    {"name": "MATH 152", "condition": "", "children": []}
  ]
}

Input: "BC Math 12 or equivalent with a minimum grade of C-"
Output:
{
  "name": "BC Math 12",
  "condition": "",
  "children": []
}

CRITICAL: Return ONLY the JSON object. No explanations, no markdown, no additional text.`;

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const { prerequisiteText, courseCode } = JSON.parse(event.body);

    if (!prerequisiteText || prerequisiteText.trim() === '') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          tree: {
            name: courseCode || 'ROOT',
            condition: '',
            children: [],
          },
          source: 'empty',
          message: 'No prerequisites',
        }),
      };
    }

    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('🔍 Parsing prerequisite for:', courseCode);
    console.log('📝 Text:', prerequisiteText.substring(0, 100) + '...');

    // 直接调用 Gemini REST API
    // 使用你的 API Key 支持的最新模型
    const modelNames = [
      'gemini-2.5-flash-preview-05-20',  // 最快，推荐
      'gemini-2.5-pro-preview-03-25',    // 备选
    ];
    
    const prompt = `${SYSTEM_PROMPT}\n\nNow parse this prerequisite text:\n\n"${prerequisiteText}"\n\nReturn ONLY the JSON object:`;
    
    let aiResponse = null;
    let lastError = null;
    
    // 尝试每个模型，直到成功
    for (const modelName of modelNames) {
      try {
        console.log(`🔄 Trying model: ${modelName}`);
        
        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`;
        
        const response = await fetch(GEMINI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 2048,  // 增加输出长度，避免 JSON 被截断
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.log(`❌ Model ${modelName} failed: ${response.status}`);
          lastError = new Error(`API error: ${response.status} - ${errorText}`);
          continue; // 尝试下一个模型
        }

        const data = await response.json();
        
        // 检查响应结构
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
          console.log(`❌ Model ${modelName} returned invalid structure:`, JSON.stringify(data).substring(0, 200));
          lastError = new Error('Invalid response structure');
          continue;
        }
        
        aiResponse = data.candidates[0].content.parts[0].text;
        
        console.log(`✅ Model ${modelName} worked!`);
        break; // 成功了，退出循环
        
      } catch (error) {
        console.log(`❌ Model ${modelName} exception:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    // 如果所有模型都失败了
    if (!aiResponse) {
      throw lastError || new Error('All models failed');
    }

    console.log('🤖 Gemini response (full):', aiResponse);

    // Extract JSON from response (handle various formats)
    let jsonText = aiResponse.trim();
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
    
    // Try to find JSON object (greedy match to get complete JSON)
    let jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    
    // If not found, try without newlines
    if (!jsonMatch) {
      jsonText = jsonText.replace(/\n/g, ' ');
      jsonMatch = jsonText.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
    }
    
    if (!jsonMatch) {
      console.error('❌ Could not extract JSON from response:', aiResponse);
      throw new Error('No valid JSON found in AI response');
    }

    console.log('📦 Extracted JSON:', jsonMatch[0]);
    const parsedTree = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (!parsedTree.name || !parsedTree.hasOwnProperty('condition') || !parsedTree.hasOwnProperty('children')) {
      throw new Error('Invalid tree structure from AI');
    }

    console.log('✅ Successfully parsed:', courseCode);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        tree: parsedTree,
        source: 'gemini',
        confidence: 0.9,
      }),
    };

  } catch (error) {
    console.error('❌ Parsing error:', error.message);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        source: 'gemini',
      }),
    };
  }
};

