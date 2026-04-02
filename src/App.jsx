import React, { useEffect, useState } from 'react';
import Sidebar from './components/sidebar/Sidebar'
import MainContent from './components/main/MainContent';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const parseJsonIfPossible = (value) => {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(normalized);
  } catch {
    return null;
  }
};

const normalizeChatPayload = (payload) => {
  const parsedFromResponse = parseJsonIfPossible(payload?.response);

  const answer =
    parsedFromResponse?.answer ||
    payload?.answer ||
    payload?.response ||
    'Cevap alinamadi.';

  const hadiths = Array.isArray(parsedFromResponse?.hadiths)
    ? parsedFromResponse.hadiths
    : Array.isArray(payload?.hadiths)
      ? payload.hadiths
      : [];

  const sources = Array.isArray(payload?.sources)
    ? payload.sources
    : Array.isArray(parsedFromResponse?.sources)
      ? parsedFromResponse.sources
      : [];

  const sections = Array.isArray(parsedFromResponse?.sections)
    ? parsedFromResponse.sections
    : Array.isArray(payload?.sections)
      ? payload.sections
      : [];

  const fetvalar = Array.isArray(parsedFromResponse?.fetvalar)
    ? parsedFromResponse.fetvalar
    : Array.isArray(payload?.fetvalar)
      ? payload.fetvalar
      : [];

  return { answer, hadiths, sections, sources, fetvalar };
};

const unescapeJsonLikeString = (value) =>
  value
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');

const extractAnswerFromJsonLikeStream = (rawText) => {
  const answerKeyMatch = rawText.match(/"answer"\s*:\s*"/);
  if (!answerKeyMatch) return null;

  const startIndex = (answerKeyMatch.index || 0) + answerKeyMatch[0].length;
  let cursor = startIndex;
  let escaped = false;
  let answer = '';

  while (cursor < rawText.length) {
    const ch = rawText[cursor];

    if (escaped) {
      answer += `\\${ch}`;
      escaped = false;
      cursor += 1;
      continue;
    }

    if (ch === '\\') {
      escaped = true;
      cursor += 1;
      continue;
    }

    if (ch === '"') {
      return unescapeJsonLikeString(answer);
    }

    answer += ch;
    cursor += 1;
  }

  return unescapeJsonLikeString(answer);
};

const getDisplayTextFromStreamRaw = (rawText) => {
  const trimmed = rawText.trimStart();
  const jsonLike = trimmed.startsWith('{') || trimmed.includes('"answer"');

  if (!jsonLike) return rawText;

  const parsed = parseJsonIfPossible(rawText);
  if (parsed?.answer) return parsed.answer;

  return extractAnswerFromJsonLikeStream(rawText) || '';
};

const findFieldValueStart = (rawText, fieldName) => {
  const pattern = new RegExp(`"${fieldName}"\\s*:\\s*`);
  const match = pattern.exec(rawText);
  if (!match) return -1;
  return match.index + match[0].length;
};

const findJsonValueEndIndex = (rawText, startIndex) => {
  if (startIndex < 0 || startIndex >= rawText.length) return -1;

  const firstChar = rawText[startIndex];

  if (firstChar === '"') {
    let escaped = false;
    for (let i = startIndex + 1; i < rawText.length; i += 1) {
      const ch = rawText[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === '"') return i;
    }
    return -1;
  }

  if (firstChar !== '[' && firstChar !== '{') {
    for (let i = startIndex; i < rawText.length; i += 1) {
      const ch = rawText[i];
      if (ch === ',' || ch === '}' || ch === ']') return i - 1;
    }
    return rawText.length - 1;
  }

  const stack = [firstChar];
  let inString = false;
  let escaped = false;

  for (let i = startIndex + 1; i < rawText.length; i += 1) {
    const ch = rawText[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === '{' || ch === '[') {
      stack.push(ch);
      continue;
    }

    if (ch === '}' || ch === ']') {
      if (stack.length === 0) return -1;
      stack.pop();
      if (stack.length === 0) return i;
    }
  }

  return -1;
};

const extractProgressiveArrayField = (rawText, fieldName) => {
  const valueStart = findFieldValueStart(rawText, fieldName);
  if (valueStart < 0 || rawText[valueStart] !== '[') return [];

  const content = rawText.slice(valueStart + 1);
  const parsedItems = [];

  let inString = false;
  let escaped = false;
  let depth = 0;
  let itemStart = 0;

  const tryPushItem = (endExclusive) => {
    const candidate = content.slice(itemStart, endExclusive).trim();
    if (!candidate) return;

    try {
      parsedItems.push(JSON.parse(candidate));
    } catch {
      // Incomplete fragments are expected during stream.
    }
  };

  for (let i = 0; i < content.length; i += 1) {
    const ch = content[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === '{' || ch === '[') {
      depth += 1;
      continue;
    }

    if (ch === '}' || ch === ']') {
      if (depth > 0) {
        depth -= 1;
      } else if (ch === ']') {
        tryPushItem(i);
        return parsedItems;
      }
      continue;
    }

    if (ch === ',' && depth === 0) {
      tryPushItem(i);
      itemStart = i + 1;
    }
  }

  // If a complete item is already available at the tail, keep it.
  tryPushItem(content.length);
  return parsedItems;
};

const getStructuredPayloadFromStreamRaw = (rawText) => {
  const trimmed = rawText.trimStart();
  const jsonLike = trimmed.startsWith('{') || trimmed.includes('"answer"');

  if (!jsonLike) {
    return {
      answer: rawText,
      hadiths: [],
      sections: [],
      sources: [],
    };
  }

  const parsed = parseJsonIfPossible(rawText);
  if (parsed && typeof parsed === 'object') {
    return {
      answer: typeof parsed.answer === 'string' ? parsed.answer : '',
      hadiths: Array.isArray(parsed.hadiths) ? parsed.hadiths : [],
      sections: Array.isArray(parsed.sections) ? parsed.sections : [],
      sources: Array.isArray(parsed.sources) ? parsed.sources : [],
      fetvalar: Array.isArray(parsed.fetvalar) ? parsed.fetvalar : [],
    };
  }

  const progressiveHadiths = extractProgressiveArrayField(rawText, 'hadiths');
  const progressiveSections = extractProgressiveArrayField(rawText, 'sections');
  const progressiveSources = extractProgressiveArrayField(rawText, 'sources');

  const progressiveFetvalar = extractProgressiveArrayField(rawText, 'fetvalar');

  return {
    answer: getDisplayTextFromStreamRaw(rawText),
    hadiths: progressiveHadiths,
    sections: progressiveSections,
    sources: progressiveSources,
    fetvalar: progressiveFetvalar,
  };
};

export default function App() {


  const [currentMessages, setCurrentMessages] = useState([]);

  //helper states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  //main states
  const [currentProvider, setCurrentProvider] = useState('');
  const [availableProviders, setAvailableProviders] = useState([]);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [currentAgent, setCurrentAgent] = useState('D1');
  const [chatSource, setChatSource] = useState('hadith');

  const sourceOptions = [
    { value: 'hadith', label: 'Hadis' },
    { value: 'siyer', label: 'Siyer' },
    { value: 'fetva', label: 'Fetva' },
  ];

  const setStreamingMessagePayload = (messageId, nextPayload) => {

    setCurrentMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id !== messageId) return msg;

        const prevHadiths = Array.isArray(msg.text?.hadiths) ? msg.text.hadiths : [];
        const prevSections = Array.isArray(msg.text?.sections) ? msg.text.sections : [];
        const prevSources = Array.isArray(msg.text?.sources) ? msg.text.sources : [];
        const prevFetvalar = Array.isArray(msg.text?.fetvalar) ? msg.text.fetvalar : [];

        const nextHadiths = Array.isArray(nextPayload?.hadiths) && nextPayload.hadiths.length > 0
          ? nextPayload.hadiths
          : prevHadiths;
        const nextSections = Array.isArray(nextPayload?.sections) && nextPayload.sections.length > 0
          ? nextPayload.sections
          : prevSections;
        const nextSources = Array.isArray(nextPayload?.sources) && nextPayload.sources.length > 0
          ? nextPayload.sources
          : prevSources;
        const nextFetvalar = Array.isArray(nextPayload?.fetvalar) && nextPayload.fetvalar.length > 0
          ? nextPayload.fetvalar
          : prevFetvalar;

        return {
          ...msg,
          text: {
            ...(typeof msg.text === 'object' && msg.text ? msg.text : {}),
            answer: typeof nextPayload?.answer === 'string' ? nextPayload.answer : '',
            hadiths: nextHadiths,
            sections: nextSections,
            sources: nextSources,
            fetvalar: nextFetvalar,
          },
          sources: nextSources,
          isStreaming: true,
          hasStreamContent: Boolean(nextPayload?.hasStreamContent),
        };
      })
    );
  };

  //1-)Load Models
    useEffect(() => {
      console.log(`${API_BASE_URL}/api/models`);
      fetch(`${API_BASE_URL}/api/models`)
        .then(res => res.json())
        .then(models => {
          setAvailableProviders(models);
          if (models.length > 0) {
            setCurrentProvider(models[0].name);
          }
        })
        .catch(console.error);
    }, []);


  //2-Load Agents
    useEffect(() => {
      console.log(`${API_BASE_URL}/api/agents`);
      fetch(`${API_BASE_URL}/api/agents`)
        .then(res => res.json())
        .then(agents => {
          setAvailableAgents(agents);
          // Set D1 as default agent if available
          const d1Agent = agents.find(agent => agent.id === 'D1');
          if (d1Agent) {
            setCurrentAgent(d1Agent.id);
          }
        })
        .catch(console.error);
    }, []);


  const handleSendMessage = async (inputText) => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    const aiMessageId = Date.now() + 1;
    const streamingMessage = {
      id: aiMessageId,
      text: { answer: '', hadiths: [], sections: [], sources: [], fetvalar: [] },
      sender: 'ai',
      timestamp: new Date().toISOString(),
      sources: [],
      isStreaming: true,
      hasStreamContent: false,
    };

    setCurrentMessages(prevMessages => [...prevMessages, userMessage, streamingMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const requestBody = { 
        message: inputText, 
        ai_provider: currentProvider,
        agent_id: currentAgent,
        source: chatSource,
      };

      const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({
          message: 'Failed to send message'
        }));
        throw new Error(errData.error || errData.message || `HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Streaming body bulunamadi.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let streamCompleted = false;
      let streamRawAnswer = '';

      const handleSseEvent = (eventName, rawData) => {
        let payload = {};
        try {
          payload = JSON.parse(rawData || '{}');
        } catch {
          payload = {};
        }

        if (eventName === 'token') {
          streamRawAnswer += payload.content || '';
          const progressivePayload = getStructuredPayloadFromStreamRaw(streamRawAnswer);

          setStreamingMessagePayload(aiMessageId, {
            answer: progressivePayload.answer,
            hadiths: progressivePayload.hadiths,
            sections: progressivePayload.sections,
            sources: progressivePayload.sources,
            hasStreamContent: true,
          });
          return;
        }

        if (eventName === 'context') {
          // For fetva: populate fetvalar from RAG context (full original text) before streaming starts.
          if (Array.isArray(payload.fetvalar) && payload.fetvalar.length > 0) {
            setStreamingMessagePayload(aiMessageId, {
              fetvalar: payload.fetvalar,
              sources: Array.isArray(payload.sources) ? payload.sources : [],
            });
          }
          return;
        }

        if (eventName === 'done') {
          const normalizedData = normalizeChatPayload(payload.result || {});

          setCurrentMessages((prevMessages) =>
            prevMessages.map((msg) => {
              if (msg.id !== aiMessageId) return msg;
              // Prefer context fetvalar (full RAG text) over LLM-generated ones
              const contextFetvalar = Array.isArray(msg.text?.fetvalar) && msg.text.fetvalar.length > 0
                ? msg.text.fetvalar
                : normalizedData.fetvalar || [];
              return {
                ...msg,
                text: { ...normalizedData, fetvalar: contextFetvalar },
                sources: normalizedData.sources || [],
                isStreaming: false,
                hasStreamContent: true,
              };
            })
          );

          streamCompleted = true;
          return;
        }

        if (eventName === 'error') {
          throw new Error(payload.message || 'Stream hatasi olustu.');
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split('\n\n');
        buffer = frames.pop() || '';

        for (const frame of frames) {
          const lines = frame.split('\n');
          let eventName = 'message';
          const dataLines = [];

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              dataLines.push(line.slice(5).trim());
            }
          }

          if (dataLines.length > 0) {
            handleSseEvent(eventName, dataLines.join('\n'));
          }
        }
      }

      if (!streamCompleted) {
        setCurrentMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  isStreaming: false,
                }
              : msg
          )
        );
      }

      return;

    } catch (err) {
      setError(err.message);

      setCurrentMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                isStreaming: false,
                hasStreamContent: Boolean(msg.text?.answer),
              }
            : msg
        )
      );

      const errorMessage = {
        id: Date.now() + 1,
        text: `Error: ${err.message}`,
        sender: 'system',
        timestamp: new Date().toISOString(),
      };

      setCurrentMessages(prevMessages => [...prevMessages, errorMessage]);


    } finally {
      setIsLoading(false);
    }
  };







  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MainContent
        messages={currentMessages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading} 
        error={error}
        chatSource={chatSource}
        onChatSourceChange={setChatSource}
        sourceOptions={sourceOptions}

      />
    </div>
  )
}