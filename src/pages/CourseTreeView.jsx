import React, { useState, useEffect, useRef, useCallback } from "react";
import TreeView from "../components/TreeView";
import { parseWithAI, isComplexPrerequisite } from "../utils/aiParser";

// ============================================================================
// AI-ENHANCED PARSING TOGGLE
// ============================================================================
// Set to true to enable AI fallback for complex prerequisites
// Set to false to use only local parsing (original behavior)
const ENABLE_AI_FALLBACK = true;

// 工具函数：兼容所有格式
function parseCourseKey(token) {
  // 兼容 "CMPT 125" / "CMPT125" / "CMPT125W" / "cmpt125"
  token = token.toUpperCase().replace(/\s+/g, "");
  const match = token.match(/^([A-Z]+)([0-9]{3,4}[A-Z]?)$/);
  if (!match) return [null, null];
  return [match[1], match[2]];
}

const CourseTreeView = () => {
  const [courseData, setCourseData] = useState(null);
  const [courseNumber, setCourseNumber] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [extraInfo, setExtraInfo] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); // Track if user has searched
  const [suggestions, setSuggestions] = useState([]); // Auto-suggestions
  const [showSuggestions, setShowSuggestions] = useState(false); // Show/hide suggestions
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1); // Keyboard navigation
  const [searchHistory, setSearchHistory] = useState([]); // Search history
  const [showHistory, setShowHistory] = useState(false); // Show/hide history dropdown
  const [showCachePanel, setShowCachePanel] = useState(false); // Show/hide cache management panel
  const [showStoragePanel, setShowStoragePanel] = useState(false); // Show/hide localStorage panel
  const [showDevTools, setShowDevTools] = useState(false); // Show/hide entire developer tools panel
  const extraInfoRef = useRef([]);
  const suggestionsRef = useRef(null); // Ref for suggestions dropdown
  const historyRef = useRef(null); // Ref for history dropdown

  // Debug: Log searchHistory changes
  useEffect(() => {
    console.log('🔄 [History] State updated:', searchHistory, 'Length:', searchHistory.length);
  }, [searchHistory]);

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('course-search-history');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        console.log('📚 [History] Loaded from localStorage:', parsed);
        
        // Validate that it's an array of valid course codes
        if (Array.isArray(parsed)) {
          // Filter out invalid items (single characters, empty strings, etc.)
          const validHistory = parsed.filter(item => {
            return typeof item === 'string' && item.length > 1 && item.trim().length > 1;
          });
          
          console.log('📚 [History] Valid items:', validHistory);
          
          if (validHistory.length > 0) {
            setSearchHistory(validHistory);
            // Update localStorage with cleaned data
            localStorage.setItem('course-search-history', JSON.stringify(validHistory));
          } else {
            console.warn('⚠️ [History] No valid items, clearing...');
            localStorage.removeItem('course-search-history');
          }
        } else {
          console.error('❌ [History] Invalid format, clearing...');
          localStorage.removeItem('course-search-history');
        }
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
      localStorage.removeItem('course-search-history');
    }
  }, []);

  // 1. Load and normalize all courses from multiple departments
  useEffect(() => {
    Promise.all([
      // CMPT courses
      import("../assets/sfu_courses_2025/cmpt/sfu_cmpt_2025_spring.json"),
      import("../assets/sfu_courses_2025/cmpt/sfu_cmpt_2025_summer.json"),
      import("../assets/sfu_courses_2025/cmpt/sfu_cmpt_2025_fall.json"),
      // MATH courses
      import("../assets/sfu_courses_2025/math/sfu_math_2025_fall.json"),
      // BPK courses
      import("../assets/sfu_courses_2025/bpk/sfu_bpk_2025_summer.json"),
      import("../assets/sfu_courses_2025/bpk/sfu_bpk_2025_fall.json"),
      // BUS courses
      import("../assets/sfu_courses_2025/bus/sfu_bus_2025_summer.json"),
      import("../assets/sfu_courses_2025/bus/sfu_bus_2025_fall.json"),
      // ENSC courses
      import("../assets/sfu_courses_2025/ensc/sfu_ensc_2025_summer.json"),
      import("../assets/sfu_courses_2025/ensc/sfu_ensc_2025_fall.json"),
    ])
      .then(([
        cmptSpring, cmptSummer, cmptFall,
        mathFall,
        bpkSummer, bpkFall,
        busSummer, busFall,
        enscSummer, enscFall
      ]) => {
        // 合并所有专业和学期
        const merged = [
          // CMPT
          ...(cmptSpring.default || []),
          ...(cmptSummer.default || []),
          ...(cmptFall.default || []),
          // MATH
          ...(mathFall.default || []),
          // BPK
          ...(bpkSummer.default || []),
          ...(bpkFall.default || []),
          // BUS
          ...(busSummer.default || []),
          ...(busFall.default || []),
          // ENSC
          ...(enscSummer.default || []),
          ...(enscFall.default || []),
        ];

        // 标准化，自动抽subject
        const normalized = merged.map((item) => {
          let subject =
            item.subject ||
            item.department ||
            item.code ||
            item.subject_area ||
            "";
          if (!subject && item.name) {
            const match = item.name.match(/^([A-Z]+)\s/);
            if (match) subject = match[1];
          }
          return {
            ...item,
            course_number: String(item.course_number).toUpperCase(),
            subject: String(subject).toUpperCase(),
          };
        });

        // 用 Map 去重，只保留每个 subject+course_number 的最新一项
        const dedupedMap = new Map();
        for (const course of normalized) {
          // 以"CMPT 225"为key，后面遇到的会覆盖前面，或者你喜欢只保留第一次出现的可以加 if (!dedupedMap.has(key))
          const key = `${course.subject} ${course.course_number}`;
          dedupedMap.set(key, course);
        }
        const deduped = Array.from(dedupedMap.values());

        console.log("去重后的allCourses示例:", deduped[0]);
        setAllCourses(deduped);
      })
      .catch((error) => console.error("Failed to load course data", error));
  }, []);
  console.log("allCourses:", allCourses);
  // 2. Search and recursive
  useEffect(() => {
    if (courseNumber && allCourses.length > 0) {
      setHasSearched(true); // Mark that a search has been performed
      setCourseData(null);
      extraInfoRef.current = [];

      // 拆分兼容格式，始终规范成 "CMPT 125"
      const [subject, num] = parseCourseKey(courseNumber);
      const inputNum =
        subject && num
          ? `${subject} ${num}`
          : courseNumber.toUpperCase().trim();

      const course = allCourses.find(
        (c) => `${c.subject} ${c.course_number}` === inputNum
      );
      console.log(
        "[Search] Input course number",
        inputNum,
        " | Searched Courses:",
        course
      );

      if (course && course.prerequisites) {
        // Set loading state while AI is parsing
        setCourseData({ loading: true });
        
        // AI-Enhanced parsing with smart fallback
        parsePrerequisitesWithAI(
          course.prerequisites,
          allCourses,
          `${course.subject} ${course.course_number}`
        ).then((parsedData) => {
        setCourseData(parsedData);
        setExtraInfo([...extraInfoRef.current]);
        }).catch((error) => {
          console.error('AI parsing failed:', error);
          setCourseData(null);
          setExtraInfo([...extraInfoRef.current]);
        });
      } else {
        setCourseData(null);
        setExtraInfo([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseNumber, allCourses]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSuggestions]);

  // Close history dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (historyRef.current && !historyRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    };

    if (showHistory) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showHistory]);

  // Simple cache for AI parsing results (in-memory)
  const aiCache = useRef(new Map());
  
  // LocalStorage key for persistent cache
  const CACHE_STORAGE_KEY = 'course-prerequisite-cache';
  
  // Load cache from localStorage on mount
  useEffect(() => {
    try {
      const savedCache = localStorage.getItem(CACHE_STORAGE_KEY);
      if (savedCache) {
        const parsed = JSON.parse(savedCache);
        console.log('💾 [Cache] Loaded from localStorage:', Object.keys(parsed).length, 'items');
        
        // Convert object back to Map
        Object.entries(parsed).forEach(([key, value]) => {
          aiCache.current.set(key, value);
        });
        
        console.log('💾 [Cache] Cache initialized with', aiCache.current.size, 'items');
      }
    } catch (error) {
      console.error('Failed to load cache from localStorage:', error);
      localStorage.removeItem(CACHE_STORAGE_KEY);
    }
  }, []);
  
  // Cache management functions
  const removeCacheItem = (cacheKey) => {
    // Remove from memory
    aiCache.current.delete(cacheKey);
    
    // Remove from localStorage
    try {
      const savedCache = localStorage.getItem(CACHE_STORAGE_KEY);
      if (savedCache) {
        const cacheObj = JSON.parse(savedCache);
        delete cacheObj[cacheKey];
        localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cacheObj));
      }
      console.log('🗑️ [Cache] Removed cache item:', cacheKey);
    } catch (error) {
      console.error('Failed to remove cache item:', error);
    }
  };

  const clearCache = () => {
    aiCache.current.clear();
    try {
      localStorage.removeItem(CACHE_STORAGE_KEY);
      console.log('💾 [Cache] Cache cleared (memory + localStorage)');
    } catch (error) {
      console.error('Failed to clear cache from localStorage:', error);
    }
  };
  
  const getCacheInfo = () => {
    const cacheSize = aiCache.current.size;
    const cacheKeys = Array.from(aiCache.current.keys());
    return { size: cacheSize, keys: cacheKeys };
  };
  
  // Save cache entry to localStorage
  const saveCacheToStorage = (key, value) => {
    try {
      // Get current cache from localStorage
      const savedCache = localStorage.getItem(CACHE_STORAGE_KEY);
      const cacheObj = savedCache ? JSON.parse(savedCache) : {};
      
      // Add new entry
      cacheObj[key] = value;
      
      // Save back to localStorage
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cacheObj));
      console.log('💾 [Cache] Saved to localStorage:', key);
    } catch (error) {
      console.error('Failed to save cache to localStorage:', error);
      // If quota exceeded, try to clear old entries
      if (error.name === 'QuotaExceededError') {
        console.warn('⚠️ [Cache] LocalStorage quota exceeded, cache will be memory-only');
      }
    }
  };
  
  // Clear current TreeView (but keep cache)
  const clearTreeView = () => {
    setCourseData(null);
    setInputValue("");
    setCourseNumber("");
    setExtraInfo([]);
    setHasSearched(false);
    setSuggestions([]);
    setShowSuggestions(false);
    console.log('🗑️ [TreeView] TreeView cleared (cache preserved)');
  };

  // Add course to search history
  const addToHistory = useCallback((courseCode) => {
    console.log('📚 [History] addToHistory function called with:', courseCode, 'Type:', typeof courseCode);
    
    if (!courseCode || typeof courseCode !== 'string') {
      console.error('❌ [History] Invalid course code:', courseCode);
      return;
    }
    
    const cleanCode = courseCode.trim();
    console.log('📚 [History] Clean code:', cleanCode, 'Length:', cleanCode.length);
    
    if (!cleanCode) {
      console.log('⚠️ [History] Empty after trim, returning');
      return;
    }
    
    console.log('📚 [History] Proceeding to add:', cleanCode);
    
    // Use functional update to avoid stale closure
    setSearchHistory(prevHistory => {
      const newHistory = [
        cleanCode,
        ...prevHistory.filter(item => item !== cleanCode) // Remove duplicates
      ].slice(0, 10); // Keep only last 10 searches

      console.log('📚 [History] New history array:', newHistory);
      
      // Save to localStorage
      try {
        const jsonString = JSON.stringify(newHistory);
        console.log('💾 [History] Saving to localStorage:', jsonString);
        localStorage.setItem('course-search-history', jsonString);
      } catch (error) {
        console.error('Failed to save search history:', error);
      }
      
      return newHistory;
    });
  }, []);

  // Remove single item from search history
  const removeFromHistory = useCallback((courseCode) => {
    setSearchHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item !== courseCode);
      try {
        localStorage.setItem('course-search-history', JSON.stringify(newHistory));
        console.log('🗑️ [History] Removed from history:', courseCode);
      } catch (error) {
        console.error('Failed to update history:', error);
      }
      return newHistory;
    });
  }, []);

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem('course-search-history');
      console.log('🗑️ [History] Search history cleared');
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  // Load course from history
  const loadFromHistory = (courseCode) => {
    setInputValue(courseCode);
    setCourseNumber(courseCode);
    setShowHistory(false);
  };

  // Wrapper for parsePrerequisitesWithAI that also adds to history
  const parsePrerequisitesWithHistory = useCallback(async (prerequisites, allCourses, courseFullName) => {
    // Add to search history when expanding nodes
    if (courseFullName && courseFullName.trim()) {
      console.log('📚 [History] Adding expanded course to history:', courseFullName);
      addToHistory(courseFullName);
    }
    
    // Call the original parsing function
    return await parsePrerequisitesWithAI(prerequisites, allCourses, courseFullName);
  }, [addToHistory]);

  // 2.5. AI-Enhanced Parsing (按需加载，不递归)
  // 只解析当前课程，不递归解析前置课程
  // 前置课程会在用户点击展开时才解析
  async function parsePrerequisitesWithAI(prerequisites, allCourses, courseFullName) {
    if (courseFullName === "") {
      extraInfoRef.current = []; // Reset extra info only for top-level search
    }
    
    // 所有非空 prerequisite 都使用 AI
    const shouldUseAI = ENABLE_AI_FALLBACK && isComplexPrerequisite(prerequisites);
    
    if (shouldUseAI) {
      // Check cache first (memory → localStorage → AI)
      const cacheKey = `${courseFullName}:${prerequisites}`;
      let cachedResult = aiCache.current.get(cacheKey);
      let cacheSource = 'memory';
      
      // If not in memory, try localStorage
      if (!cachedResult) {
        try {
          const savedCache = localStorage.getItem(CACHE_STORAGE_KEY);
          if (savedCache) {
            const cacheObj = JSON.parse(savedCache);
            if (cacheObj[cacheKey]) {
              cachedResult = cacheObj[cacheKey];
              cacheSource = 'localStorage';
              // Load into memory cache for faster future access
              aiCache.current.set(cacheKey, cachedResult);
              console.log(`💾 [Cache] Loaded from localStorage and cached in memory: ${courseFullName}`);
            }
          }
        } catch (error) {
          console.error('Failed to load from localStorage cache:', error);
        }
      }
      
      if (cachedResult) {
        console.log(`💾 [Cache] Cache hit for ${courseFullName} (source: ${cacheSource})`);
        if (courseFullName) {
          extraInfoRef.current.push(`💾 ${courseFullName} loaded from ${cacheSource}`);
        } else {
          extraInfoRef.current.push(`💾 Loaded from ${cacheSource}`);
        }
        
        // 不递归！只标记哪些节点有前置课程（留待用户点击时加载）
        const markedResult = markNodesWithPrerequisites(cachedResult, allCourses);
        
        // 保持正确的 root node 结构：搜索课程作为 root，AI 结果作为 children
        return {
          name: courseFullName || "",
          condition: "",
          children: [markedResult],
          metadata: {
            source: `ai-cache-${cacheSource}`,
            originalText: prerequisites
          }
        };
      }
      
      console.log(`🤖 [AI] Parsing ${courseFullName} with AI (non-recursive)...`);
      
      try {
        const aiResult = await parseWithAI(prerequisites, courseFullName);
        
        if (aiResult) {
          console.log(`✅ [AI] Successfully parsed ${courseFullName} with AI`);
          if (courseFullName) {
            extraInfoRef.current.push(`🤖 ${courseFullName} parsed with AI (Gemini)`);
          } else {
            extraInfoRef.current.push('🤖 Parsed with AI (Gemini) for better accuracy');
          }
          
          // Store result in cache (memory + localStorage)
          const cacheKey = `${courseFullName}:${prerequisites}`;
          aiCache.current.set(cacheKey, aiResult);
          saveCacheToStorage(cacheKey, aiResult);
          console.log(`💾 [Cache] Stored result for ${courseFullName} (memory + localStorage)`);
          
          // 不递归！只标记哪些节点有前置课程（留待用户点击时加载）
          const markedResult = markNodesWithPrerequisites(aiResult, allCourses);
          
          // 保持正确的 root node 结构：搜索课程作为 root，AI 结果作为 children
          return {
            name: courseFullName || "",
            condition: "",
            children: [markedResult],
            metadata: {
              source: 'ai',
              originalText: prerequisites
            }
          };
        } else {
          console.log(`⚠️ [AI] AI parsing failed, falling back to local parser`);
          extraInfoRef.current.push('⚠️ AI parsing unavailable, using local parser');
        }
      } catch (error) {
        console.error(`❌ [AI] Error:`, error);
        // Check if it's a quota error
        if (error.message && error.message.includes('429')) {
          extraInfoRef.current.push('⚠️ AI quota exceeded, using local parser (will retry after cooldown)');
        } else {
          extraInfoRef.current.push('⚠️ AI parsing error, using local parser');
        }
      }
    }
    
    // Fallback to local parsing (original logic - 也改为不递归)
    console.log(`💻 [Local] Using local parser for ${courseFullName} (non-recursive)`);
    if (courseFullName) {
      extraInfoRef.current.push(`💻 ${courseFullName} parsed with local parser`);
    }
    return parsePrerequisitesNonRecursive(prerequisites, allCourses, courseFullName);
  }
  
  // Helper: 标记所有课程节点为可加载（不管是否有前置课程）
  // 递归处理所有层级的节点
  function markNodesWithPrerequisites(node, allCourses) {
    if (!node) return node;
    
    // 如果节点有 children 数组，递归处理
    if (node.children && Array.isArray(node.children)) {
      const markedChildren = node.children.map(child => {
        // 先递归处理子节点
        const processedChild = markNodesWithPrerequisites(child, allCourses);
        
        // 如果是课程节点（不是 AND/OR 节点）
        if (processedChild.name && 
            (!processedChild.condition || (processedChild.condition !== "AND" && processedChild.condition !== "OR"))) {
          
          const [dept, num] = parseCourseKey(processedChild.name);
          if (dept && num) {
            const course = allCourses.find(
              (c) => (c.subject || "") === dept && (c.course_number || "") === num
            );
            
            // 所有课程节点都标记为可加载，不管是否有 prerequisites
            if (course) {
              console.log(`✅ [Mark] ${processedChild.name} marked as expandable`);
              return {
                ...processedChild,
                hasPrerequisites: true,  // 总是 true，让所有课程都显示提示器
                prerequisiteText: course.prerequisites || '',  // 即使为空也保存
              };
            }
          }
        }
        
        return processedChild;
      });
      
      return {
        ...node,
        children: markedChildren
      };
    }
    
    return node;
  }
  
  // 非递归的本地解析（只解析第一层）
  function parsePrerequisitesNonRecursive(prerequisites, allCourses, courseFullName) {
    // 创建一个特殊的 visited set，预先包含所有可能的课程
    // 这样在解析时，所有课程节点都会被认为"已访问"，从而阻止递归
    const preventRecursionSet = new Set(
      allCourses.map(c => `${c.subject} ${c.course_number}`)
    );
    
    // 但我们仍然需要解析当前课程本身，所以从 set 中移除它
    if (courseFullName) {
      preventRecursionSet.delete(courseFullName);
    }
    
    const result = parsePrerequisites(
      prerequisites,
      allCourses,
      preventRecursionSet, // 传入"几乎所有"课程作为 visited
      courseFullName
    );
    
    return result;
  }

  // 3. Recursive (Local Parser - Original Logic).
  function parsePrerequisites(
    prerequisites,
    allCourses,
    visited = new Set(),
    courseFullName = ""
  ) {
    let removedDescriptions = [];
    prerequisites = prerequisites.replace(
      /(for students in an Applied Physics program|both with a minimum grade of [A-Z-]| all with a minimum grade of [A-Z-]+\.)|(\s+with a minimum grade of C-)|(\s*MATH \d{3} or MATH \d{3} with (at least a|a grade of at least) B\+ may be substituted for MATH \d{3}( or MATH \d{3})?( \([^)]*\))?|\s*CMPT \d{3} and \d{3} are recommended|\s*are recommended)|(\s*at least \d+ units)|(\s*CGPA and UDGPA over \d+\.\d+)|(\s*enrolled in any [^,]+ program)|(\s*Participation in the [^,]+ is competitive and an application must be submitted to the [^,]+ by a defined due date announced each term)/g,
      function (match) {
        removedDescriptions.push(match.trim());
        return "";
      }
    );
    if (removedDescriptions.length > 0) {
      extraInfoRef.current.push(...removedDescriptions);
    }

    prerequisites = prerequisites.replace(
      /(\w+)\s+(\d+[A-Z]?)(\s*(?:,|and)\s*\d+[A-Z]?)+/g,
      (match, dept, firstCourse, remainingCourses) => {
        remainingCourses = remainingCourses.replace(
          /(\s*(?:,|and)\s*)(\d+[A-Z]?)/g,
          `$1${dept} $2`
        );
        return `${dept} ${firstCourse}${remainingCourses}`;
      }
    );
    prerequisites = prerequisites.trim();

    // 这里允许同时兼容有无空格格式
    const tokens =
      prerequisites.match(/\(|\)|[A-Z]+\s*[0-9]{3,4}[A-Z]?|and|or/gi) || [];
    let index = 0;

    function parseExpression() {
      let exprStack = [];
      let current = { name: "ROOT", condition: "", children: [] };
      while (index < tokens.length) {
        let token = tokens[index];
        index++;

        if (token === "(") {
          exprStack.push(current);
          current = { name: "ROOT", condition: "", children: [] };
          continue;
        }

        if (
          token &&
          (token.toUpperCase() === "AND" || token.toUpperCase() === "OR")
        ) {
          if (current.name === "ROOT") {
            current.name = token.toUpperCase();
            current.condition = token.toUpperCase();
          } else {
            let newNode = {
              name: token.toUpperCase(),
              condition: token.toUpperCase(),
              children: [],
            };
            exprStack.push(current);
            current = newNode;
          }
          continue;
        }

        if (token === ")") {
          let completed = current;
          current = exprStack.pop();
          current.children.push(completed);
          continue;
        }

        // 新增：兼容无空格和有空格格式
        if (/^[A-Z]+\s*[0-9]{3,4}[A-Z]?$/.test(token.toUpperCase())) {
          const [dept, num] = parseCourseKey(token);
          if (!dept || !num) {
            console.error(
              "illegal token: ",
              token,
              "Can't split subject and course_number"
            );
            current.children.push({ name: token, condition: "", children: [] });
            continue;
          }
          const key = `${dept} ${num}`;
          console.log(
            "[token]=",
            token,
            "| [dept]=",
            dept,
            "| [num]=",
            num,
            "| [key]=",
            key
          );

            const matched = allCourses.filter(
              (c) =>
                (c.subject || "") === dept && (c.course_number || "") === num
            );
            console.log(
            "Search course key:",
              key,
              "result:",
              matched.length,
              matched
            );

            const found = matched[0];
            let childNode = { name: key, condition: "", children: [] };
          
          // 标记节点是否有前置课程（用于按需加载）
            if (found && found.prerequisites && found.prerequisites.trim()) {
            childNode.hasPrerequisites = true;
            childNode.prerequisiteText = found.prerequisites;
          }
          
          // 检查是否已访问过（防止循环）
          const alreadyVisited = visited.has(key);
          
          if (!alreadyVisited) {
            visited.add(key);
            
            // 只有在有前置且不是"阻止递归"模式下才递归解析
            if (childNode.hasPrerequisites) {
              console.log(
                "Recursively search: ",
                key,
                "pre:",
                found.prerequisites
              );
              const subTree = parsePrerequisites(
                found.prerequisites,
                allCourses,
                new Set(visited),
                key
              );
              if (subTree && subTree.children && subTree.children.length > 0) {
                childNode.children = subTree.children;
                childNode.condition = subTree.condition || "";
              }
            }
          }
          
          current.children.push(childNode);
          continue;
        }

        console.warn("This is unknown token:", token);
        current.children.push({
          name: String(token),
          condition: "",
          children: [],
        });
      }
      return current.children.length === 1 ? current.children[0] : current;
    }

    return {
      name: courseFullName || "",
      condition: "",
      children: [parseExpression()],
    };
  }

  // 搜索框：自动兼容格式
  const handleSearch = () => {
    const trimmedInput = inputValue.trim();
    console.log('🔍 [Search] handleSearch called, input:', trimmedInput);
    
    if (!trimmedInput) {
      console.log('⚠️ [Search] Empty input, aborting');
      return;
    }
    
    const [subject, num] = parseCourseKey(trimmedInput);
    const searchQuery = subject && num ? `${subject} ${num}` : trimmedInput.toUpperCase();
    
    console.log('🔍 [Search] Parsed - Subject:', subject, 'Num:', num, 'Query:', searchQuery);
    console.log('🔍 [Search] About to call addToHistory with:', searchQuery);
    console.log('🔍 [Search] addToHistory function exists:', typeof addToHistory);
    
    setCourseNumber(searchQuery);
    
    // Call addToHistory and log it
    try {
      addToHistory(searchQuery);
      console.log('✅ [Search] addToHistory called successfully');
    } catch (error) {
      console.error('❌ [Search] Error calling addToHistory:', error);
    }
    
    setShowSuggestions(false); // Hide suggestions after search
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);
    
    // Generate suggestions if input is not empty
    if (value.trim().length > 0) {
      const filtered = allCourses
        .filter(course => {
          const courseCode = `${course.subject} ${course.course_number}`.toLowerCase();
          const searchTerm = value.toLowerCase().trim();
          return courseCode.includes(searchTerm);
        })
        .slice(0, 10); // Limit to 10 suggestions
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setActiveSuggestionIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const handleSuggestionClick = (course) => {
    const courseCode = `${course.subject} ${course.course_number}`;
    console.log('💡 [Suggestion] Suggestion clicked:', courseCode);
    
    setInputValue(courseCode);
    setCourseNumber(courseCode);
    addToHistory(courseCode); // Add to search history
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    
    console.log('💡 [Suggestion] Added to history:', courseCode);
  };

  const handleKeyDown = (event) => {
    console.log('⌨️ [Keyboard] Key pressed:', event.key, 'showSuggestions:', showSuggestions);
    
    if (!showSuggestions) {
      if (event.key === 'Enter') {
        console.log('⌨️ [Keyboard] Enter pressed without suggestions, calling handleSearch');
        event.preventDefault(); // 防止表单提交
        handleSearch();
      }
      return;
    }

    console.log('⌨️ [Keyboard] Suggestions visible, active index:', activeSuggestionIndex);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        event.preventDefault();
        console.log('⌨️ [Keyboard] Enter pressed with suggestions');
        if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
          console.log('⌨️ [Keyboard] Selecting suggestion at index:', activeSuggestionIndex);
          handleSuggestionClick(suggestions[activeSuggestionIndex]);
        } else {
          console.log('⌨️ [Keyboard] No active suggestion, calling handleSearch');
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex-grow mt-4 sm:mt-8 p-3 sm:p-4 max-w-screen-xl mx-auto w-full">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
          Course Prerequisite Tree Viewer
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Visualize course prerequisites in an interactive tree structure
        </p>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Supports: <span className="font-semibold text-blue-600">CMPT</span>, <span className="font-semibold text-purple-600">MATH</span>, <span className="font-semibold text-green-600">BPK</span>, <span className="font-semibold text-red-600">BUS</span>, <span className="font-semibold text-orange-600">ENSC</span>
        </p>
      </div>

      {/* Search Section */}
      <div className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-200 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="font-bold text-base sm:text-lg text-gray-800">Course Search</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative" ref={suggestionsRef}>
          <input
              className="w-full px-4 py-3 text-sm sm:text-base bg-white border-2 border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm"
            type="text"
              placeholder="Enter course number (e.g., CMPT 225, BUS 201, BPK 201)"
            value={inputValue}
            onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border-2 border-blue-300 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                {suggestions.map((course, index) => {
                  const courseCode = `${course.subject} ${course.course_number}`;
                  const hasPrerequisites = course.prerequisites && course.prerequisites.trim().length > 0;
                  const isActive = index === activeSuggestionIndex;
                  
                  return (
                    <div
                      key={`${course.subject}-${course.course_number}-${index}`}
                      className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                        isActive 
                          ? 'bg-blue-100 border-l-4 border-l-blue-600' 
                          : 'hover:bg-blue-50 border-l-4 border-l-transparent'
                      }`}
                      onClick={() => handleSuggestionClick(course)}
                      onMouseEnter={() => setActiveSuggestionIndex(index)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm sm:text-base font-semibold ${
                              isActive ? 'text-blue-700' : 'text-gray-800'
                            }`}>
                              {courseCode}
                            </p>
                            {hasPrerequisites ? (
                              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                Has Prerequisites
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                No Prerequisites
                              </span>
                            )}
                          </div>
                        </div>
                        {isActive && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <p className="mt-2 text-xs sm:text-sm text-gray-600 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {showSuggestions ? 'Use ↑↓ to navigate, Enter to select, Esc to close' : 'Start typing to see suggestions'}
            </p>
          </div>
          <div className="flex gap-2 relative">
            <button
              onClick={handleSearch}
              className="px-6 h-[52px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 touch-manipulation whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search</span>
            </button>
            
            {/* History button */}
            <div className="relative" ref={historyRef}>
              <button
                onClick={() => {
                  console.log('🖱️ [History] Button clicked, current history:', searchHistory);
                  setShowHistory(!showHistory);
                }}
                className={`px-4 h-[52px] ${searchHistory.length > 0 ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800' : 'bg-gray-400 cursor-not-allowed'} text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 touch-manipulation relative`}
                title={`Search History (${searchHistory.length} items)`}
                disabled={searchHistory.length === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">History</span>
                {searchHistory.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {searchHistory.length}
                  </span>
                )}
              </button>
              
              {/* History Dropdown */}
              {showHistory && searchHistory.length > 0 && (
                <div className="absolute right-0 mt-2 w-64 sm:w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto animate-fadeIn">
                  <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 text-sm">Search History</h3>
                    <button
                      onClick={clearHistory}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="py-1">
                    {searchHistory.filter(item => typeof item === 'string' && item.length > 0).map((item, index) => (
                      <div
                        key={index}
                        className="w-full px-4 py-2.5 hover:bg-blue-50 transition-colors flex items-center justify-between group"
                      >
                        <button
                          onClick={() => loadFromHistory(item)}
                          className="flex-1 text-left flex items-center justify-between"
                        >
                          <span className="font-medium text-gray-700 group-hover:text-blue-600">{String(item)}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromHistory(item);
                          }}
                          className="ml-2 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove from history"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Clear TreeView button - only show when there's a tree displayed */}
            {courseData && (
              <button
                onClick={clearTreeView}
                className="px-4 h-[52px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 touch-manipulation animate-fadeIn"
                title="Clear current tree view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="hidden sm:inline">Clear</span>
                <span className="sm:hidden">✕</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {courseData ? (
        <TreeView 
          data={courseData} 
          allCourses={allCourses}
          onLoadPrerequisites={parsePrerequisitesWithHistory}
        />
      ) : hasSearched ? (
        // No results found after search
        <div className="text-sm sm:text-base text-gray-600 p-6 sm:p-8 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-dashed border-red-300 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-lg font-semibold text-red-700 mb-2">No Results Found</p>
          <p className="text-red-600 mb-3">
            Course "<span className="font-semibold">{courseNumber}</span>" was not found or has no prerequisites.
          </p>
          <p className="text-sm text-gray-600">
            Please check the course number and try again, or try a different course.
          </p>
        </div>
      ) : (
        // Initial state - no search performed yet
        <div className="text-sm sm:text-base text-gray-600 p-6 sm:p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-lg font-semibold text-gray-700 mb-2">Ready to Explore</p>
          <p className="text-gray-500">Enter a course number above to view its prerequisite tree</p>
        </div>
      )}

      {/* Extra Info Section */}
      {courseData && extraInfo.length > 0 && (
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-amber-50 rounded-xl border border-amber-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="font-bold text-base sm:text-lg text-amber-900">
              Additional Notes for {courseData.name}
            </h2>
          </div>
          <ul className="space-y-2 text-sm sm:text-base">
            {extraInfo.map((text, index) => (
              <li key={index} className="text-amber-800 pl-2 flex gap-2">
                <span className="font-semibold text-amber-900">{index + 1}.</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Developer Tools Toggle Button */}
      <div className="mt-6 sm:mt-8 flex justify-center">
        <button
          onClick={() => setShowDevTools(!showDevTools)}
          className="px-4 py-2 bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm border border-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium">{showDevTools ? 'Hide' : 'Show'} Advanced Settings</span>
          <span className="text-xs bg-white px-2 py-0.5 rounded shadow-sm border border-gray-200">
            Cache: {getCacheInfo().size} | History: {searchHistory.length}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-500 transition-transform ${showDevTools ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Developer Tools Panel - Collapsible */}
      {showDevTools && (
        <div className="mt-4 p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-md border border-gray-300 animate-fadeIn">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* AI Cache Panel */}
          <div className="bg-white rounded-lg p-4 border-2 border-blue-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setShowCachePanel(!showCachePanel)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <span>AI Cache ({getCacheInfo().size})</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${showCachePanel ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                onClick={clearCache}
                className="text-xs px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium shadow-sm"
              >
                Clear All
              </button>
            </div>
            
            {showCachePanel && (
              <div className="max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-2 border border-gray-200">
                {getCacheInfo().keys.length > 0 ? (
                  <div className="space-y-1">
                    {getCacheInfo().keys.map((key, index) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-blue-50 rounded group bg-white border border-gray-200">
                        <span className="text-gray-700 truncate flex-1 text-xs font-mono">{key}</span>
                        <button
                          onClick={() => {
                            removeCacheItem(key);
                            setShowCachePanel(false);
                            setTimeout(() => setShowCachePanel(true), 50);
                          }}
                          className="ml-2 text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                          title="Remove this cache entry"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4 text-sm">No cache entries</p>
                )}
              </div>
            )}
          </div>

          {/* LocalStorage Panel */}
          <div className="bg-white rounded-lg p-4 border-2 border-purple-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setShowStoragePanel(!showStoragePanel)}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span>LocalStorage (2 keys)</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${showStoragePanel ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            {showStoragePanel && (
              <div className="max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-2 border border-gray-200 space-y-2">
                {/* Search History in LocalStorage */}
                <div className="bg-white border border-purple-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-purple-700">course-search-history</span>
                    <button
                      onClick={() => {
                        localStorage.removeItem('course-search-history');
                        setSearchHistory([]);
                        setShowStoragePanel(false);
                        setTimeout(() => setShowStoragePanel(true), 50);
                      }}
                      className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-gray-600 text-xs break-all bg-gray-50 p-2 rounded font-mono">
                    {localStorage.getItem('course-search-history') || 'null'}
                  </p>
                </div>

                {/* AI Cache in LocalStorage */}
                <div className="bg-white border border-purple-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-purple-700">course-prerequisite-cache</span>
                    <button
                      onClick={() => {
                        localStorage.removeItem(CACHE_STORAGE_KEY);
                        aiCache.current.clear();
                        setShowStoragePanel(false);
                        setTimeout(() => setShowStoragePanel(true), 50);
                      }}
                      className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-gray-600 text-xs break-all bg-gray-50 p-2 rounded font-mono">
                    {(() => {
                      const data = localStorage.getItem(CACHE_STORAGE_KEY);
                      if (!data) return 'null';
                      try {
                        const parsed = JSON.parse(data);
                        return `${Object.keys(parsed).length} cache entries`;
                      } catch {
                        return 'Invalid data';
                      }
                    })()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default CourseTreeView;
