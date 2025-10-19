/**
 * AI-Powered Prerequisite Parser
 * Fallback to Netlify Function (Gemini API)
 */

/**
 * Parse prerequisites using AI (Gemini via Netlify Function)
 * 
 * @param {string} prerequisiteText - Raw prerequisite text
 * @param {string} courseCode - Course code (e.g., "CMPT 225")
 * @returns {Promise<Object|null>} Parsed tree or null if failed
 */
export async function parseWithAI(prerequisiteText, courseCode) {
  try {
    console.log(`🤖 [AI Parser] Calling Gemini for ${courseCode}`);

    // Determine API endpoint based on environment
    const apiEndpoint = process.env.NODE_ENV === 'production'
      ? '/.netlify/functions/parse-prerequisite'  // Production (Netlify)
      : 'http://localhost:8888/.netlify/functions/parse-prerequisite';  // Local dev

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prerequisiteText,
        courseCode,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      console.log(`✅ [AI Parser] Success for ${courseCode} (confidence: ${(data.confidence * 100).toFixed(0)}%)`);
      return data.tree;
    } else {
      console.error(`❌ [AI Parser] Failed for ${courseCode}:`, data.error);
      return null;
    }

  } catch (error) {
    console.error(`❌ [AI Parser] Error for ${courseCode}:`, error.message);
    return null;
  }
}

/**
 * Check if prerequisite text is complex enough to warrant AI parsing
 * 
 * @param {string} text - Prerequisite text
 * @returns {boolean} True if complex
 */
export function isComplexPrerequisite(text) {
  // ⭐ 所有非空的 prerequisite 都使用 AI 解析
  if (!text || text.trim() === '') return false;
  
  // 只要有 prerequisite 文本，就使用 AI（最高准确率）
  return true;
}

/**
 * Estimate confidence of local parsing result
 * Simple heuristic based on known patterns
 * 
 * @param {Object} tree - Parsed tree
 * @param {string} originalText - Original prerequisite text
 * @returns {number} Confidence score (0-1)
 */
export function estimateLocalParseConfidence(tree, originalText) {
  let confidence = 1.0;

  // Check for warning signs
  if (!tree || !tree.children || tree.children.length === 0) {
    return 0.1;  // Very low confidence if no children
  }

  // Count nodes
  let nodeCount = 0;
  function countNodes(node) {
    nodeCount++;
    if (node.children) {
      node.children.forEach(countNodes);
    }
  }
  countNodes(tree);

  // If very few nodes but long text, likely parsing failed
  if (nodeCount < 3 && originalText.length > 100) {
    confidence -= 0.4;
  }

  // Check for "unknown" or warning markers in node names
  function checkForWarnings(node) {
    if (node.name && (
      node.name.includes('⚠️') ||
      node.name.includes('unknown') ||
      node.name === 'ROOT'
    )) {
      confidence -= 0.2;
    }
    if (node.children) {
      node.children.forEach(checkForWarnings);
    }
  }
  checkForWarnings(tree);

  return Math.max(0, Math.min(1, confidence));
}

const aiParserUtils = {
  parseWithAI,
  isComplexPrerequisite,
  estimateLocalParseConfidence,
};

export default aiParserUtils;

