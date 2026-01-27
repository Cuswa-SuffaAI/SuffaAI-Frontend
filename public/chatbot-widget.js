// Simple Embeddable Chatbot Widget
(function() {
  // Configurable variables
  const botName = 'AI Assistant';
  const welcomeMessage = 'Hi! How can I help you today?';
  const localStorageKey = 'cbw-chat-history-v1';
  
  // Dynamic configuration - can be overridden by setting window.CBW_CONFIG
  const defaultConfig = {
    apiHost: 'http://localhost:5001',
    defaultModel: 'gpt-4o-mini',
    models: [],
    defaultAgent: 'D1',
    agents: []
  };
  
  const config = { ...defaultConfig, ...window.CBW_CONFIG };

  // Create styles
  const style = document.createElement('style');
  style.textContent = `
    .cbw-container {
      position: fixed;
      bottom: 32px;
      right: 32px;
      width: 600px;
      max-width: 95vw;
      background: #fff;
      border-radius: 18px;
      box-shadow: 0 8px 32px rgba(44,62,80,0.18);
      font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1.5px solid #e6eaf1;
      animation: cbw-fadein 0.3s;
    }
    @keyframes cbw-fadein {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .cbw-header {
      background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%);
      color: #fff;
      padding: 18px 22px 16px 22px;
      font-size: 1.18em;
      font-weight: 600;
      letter-spacing: 0.01em;
      cursor: pointer;
      user-select: none;
      border-bottom: 1.5px solid #e6eaf1;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .cbw-header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .cbw-newchat-btn {
      background: #fff;
      color: #2563eb;
      border: none;
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 0.8em;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
      margin-right: 4px;
    }
    .cbw-newchat-btn:hover {
      background: #e0e7ff;
      color: #1e40af;
    }
    .cbw-header #cbw-close {
      font-size: 1.3em;
      opacity: 0.7;
      transition: opacity 0.2s;
      margin-left: 10px;
    }
    .cbw-header #cbw-close:hover {
      opacity: 1;
    }
    .cbw-model-selector {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: #fff;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 0.75em;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
      margin-right: 8px;
    }
    .cbw-model-selector:hover {
      background: rgba(255,255,255,0.2);
    }
    .cbw-model-selector option {
      background: #2563eb;
      color: #fff;
    }
    .cbw-agent-selector {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: #fff;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 0.75em;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
      margin-right: 8px;
    }
    .cbw-agent-selector:hover {
      background: rgba(255,255,255,0.2);
    }
    .cbw-agent-selector option {
      background: #2563eb;
      color: #fff;
    }
    .cbw-agent-selector option:disabled {
      color: #b0b0b0;
      font-style: italic;
    }
    .cbw-messages {
      flex: 1;
      padding: 18px 18px 8px 18px;
      overflow-y: auto;
      background: #f6f8fa;
      min-height: 200px;
      max-height: 340px;
      scrollbar-width: thin;
      scrollbar-color: #d1d5db #f6f8fa;
    }
    .cbw-messages::-webkit-scrollbar {
      width: 7px;
      background: #f6f8fa;
    }
    .cbw-messages::-webkit-scrollbar-thumb {
      background: #e5e7eb;
      border-radius: 6px;
    }
    .cbw-message {
      padding: 0px 12px !important;
      margin: 0;
      line-height: 1.7;
      max-width: 88%;
    }
    .cbw-message.user {
      text-align: right;
      color: #2563eb;
      background: #e0e7ff;
      margin-left: auto;
      margin-right: 0;
      border-bottom-right-radius: 2px;
      border-top-right-radius: 12px;
      border-top-left-radius: 12px;
      border-bottom-left-radius: 12px;
      box-shadow: 0 2px 8px rgba(37,99,235,0.04);
      padding: 0px 12px;
      margin-bottom: 14px !important;
      margin-top: 0;
    }
    .cbw-message.bot {
      text-align: left;
      color: #222;
      background: #fff;
      margin-right: auto;
      margin-left: 0;
      border-bottom-left-radius: 2px;
      border-top-right-radius: 12px;
      border-top-left-radius: 12px;
      border-bottom-right-radius: 12px;
      box-shadow: 0 2px 8px rgba(30,64,175,0.04);
      padding: 0px 12px;
      margin-bottom: 14px !important;
      margin-top: 0;
    }
    .cbw-input-row {
      display: flex;
      border-top: 1.5px solid #e6eaf1;
      background: #f6f8fa;
      padding: 10px 14px 10px 14px;
      align-items: center;
      gap: 10px;
    }
    .cbw-input {
      flex: 1;
      border: none;
      padding: 12px 14px;
      font-size: 1.05em;
      border-radius: 8px;
      outline: none;
      background: #fff;
      box-shadow: 0 1px 2px rgba(44,62,80,0.03);
      transition: box-shadow 0.2s;
      border: 1.2px solid #e6eaf1;
    }
    .cbw-input:focus {
      border-color: #2563eb;
      box-shadow: 0 2px 8px rgba(37,99,235,0.08);
    }
    .cbw-send-btn {
      background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%);
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 0 22px;
      font-size: 1.05em;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s, box-shadow 0.2s;
      box-shadow: 0 2px 8px rgba(37,99,235,0.08);
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cbw-send-btn:disabled {
      background: #b3d1ff;
      cursor: not-allowed;
      color: #fff;
    }
    .cbw-toggle-btn {
      position: fixed;
      bottom: 32px;
      right: 32px;
      background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%);
      color: #fff;
      border: none;
      border-radius: 50%;
      width: 64px;
      height: 64px;
      font-size: 2.2em;
      box-shadow: 0 6px 24px rgba(44,62,80,0.18);
      cursor: pointer;
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: box-shadow 0.2s, background 0.2s;
      outline: none;
      border: 1.5px solid #e6eaf1;
    }
    .cbw-toggle-btn:active {
      box-shadow: 0 2px 8px rgba(44,62,80,0.10);
    }
    .cbw-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #ff3b3b;
      color: #fff;
      border-radius: 50%;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1em;
      font-weight: bold;
      z-index: 10000;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(255,59,59,0.12);
      border: 2px solid #fff;
    }
    .cbw-feedback {
      margin-top: 4px;
      margin-bottom: 2px;
      padding: 4px 4px 4px 0px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .cbw-feedback-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1em;
      color: #bdbdbd;
      transition: color 0.2s, background 0.2s, transform 0.1s;
      padding: 4px 6px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 28px;
      width: 28px;
    }
    .cbw-feedback-btn.selected {
      background: #f1f5ff;
      transform: scale(1.12);
    }
    .cbw-feedback-btn.selected.up {
      color: #fff;
      background: #22c55e;
    }
    .cbw-feedback-btn.selected.down {
      color: #fff;
      background: #ef4444;
    }
    .cbw-feedback-btn.up {
      font-size: 1em;
    }
    .cbw-feedback-btn.down {
      font-size: 1em;
    }
    .cbw-feedback-btn:hover {
      background: #f3f4f6;
      color: #2563eb;
    }
    .cbw-message a {
      color: #2563eb;
      text-decoration: underline;
      word-break: break-all;
      transition: color 0.2s;
    }
    .cbw-message a:hover {
      color: #1e40af;
    }
    .cbw-message h1,
    .cbw-message h2,
    .cbw-message h3 {
      font-weight: bold;
      margin: 10px 0 6px 0;
      line-height: 1.2;
    }
    .cbw-message h1 { font-size: 1.3em; }
    .cbw-message h2 { font-size: 1.15em; }
    .cbw-message h3 { font-size: 1.08em; }
    .cbw-message code {
      background: #f3f4f6;
      padding: 2px 5px;
      border-radius: 4px;
      font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
      font-size: 0.98em;
    }
    .cbw-message pre {
      background: #f3f4f6;
      padding: 10px;
      border-radius: 6px;
      overflow-x: auto;
      font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
      font-size: 0.98em;
      margin: 8px 0;
      padding: 4px !important;
      margin: 2px 0 !important;
    }
    .cbw-message ul, .cbw-message ol {
      margin: 8px 0 8px 22px;
    }
    .cbw-message blockquote {
      border-left: 3px solid #2563eb;
      background: #f1f5ff;
      margin: 8px 0;
      padding: 6px 12px;
      border-radius: 4px;
      color: #444;
      font-style: italic;
      padding: 3px 7px !important;
      margin: 3px 0 !important;
    }
    .cbw-message table {
      border-collapse: collapse;
      margin: 8px 0;
      width: auto;
      font-size: 0.98em;
    }
    .cbw-message th, .cbw-message td {
      border: 1px solid #e5e7eb;
      padding: 6px 10px;
      text-align: left;
    }
    .cbw-message th {
      background: #f3f4f6;
      font-weight: 600;
    }
    .cbw-message table,
    .cbw-message pre,
    .cbw-message blockquote {
      width: auto;
      max-width: 100%;
      box-sizing: border-box;
      overflow-x: auto;
      margin: 4px 0;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 3px 0 !important;
    }
    .cbw-message pre {
      padding: 6px;
      margin: 4px 0;
      padding: 4px !important;
      margin: 2px 0 !important;
    }
    .cbw-message code {
      padding: 1px 4px;
      margin: 0 2px;
      white-space: pre-wrap;
      word-break: break-word;
      padding: 1px 3px !important;
      margin: 0 1px !important;
    }
    .cbw-message blockquote {
      padding: 4px 8px;
      margin: 4px 0;
      padding: 3px 7px !important;
      margin: 3px 0 !important;
    }
    .cbw-message h1,
    .cbw-message h2,
    .cbw-message h3,
    .cbw-message pre,
    .cbw-message code,
    .cbw-message blockquote,
    .cbw-message ul,
    .cbw-message ol,
    .cbw-message table {
      margin: 0px 0 !important;
      padding: 0 !important;
    }
    .cbw-message pre,
    .cbw-message code,
    .cbw-message table {
      padding: 1px 2px !important;
      font-size: 0.96em;
    }
    .cbw-message mjx-container {
      font-size: 0.97em;
    }
    .cbw-message p,
    .cbw-message ul,
    .cbw-message ol,
    .cbw-message pre,
    .cbw-message code,
    .cbw-message blockquote,
    .cbw-message h1,
    .cbw-message h2,
    .cbw-message h3 {
      margin-top: 4px !important;
      margin-bottom: 4px !important;
      padding-top: 2px !important;
      padding-bottom: 2px !important;
    }
  `;
  document.head.appendChild(style);

  // Create toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'cbw-toggle-btn';
  toggleBtn.innerHTML = `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 20.5V19C3.34315 17.8431 2.25 16.1046 2.25 14.25V8.25C2.25 5.35051 5.35051 2.25 8.25 2.25H15.75C18.6495 2.25 21.75 5.35051 21.75 8.25V14.25C21.75 17.1495 18.6495 20.25 15.75 20.25H8.66421C8.31209 20.25 7.97057 20.3817 7.70711 20.618L5.70711 22.382C5.31658 22.7236 4.75 22.4567 4.75 21.9659V20.5H5Z" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="8.5" cy="10.5" r="1.25" fill="#fff"/>
      <circle cx="12" cy="10.5" r="1.25" fill="#fff"/>
      <circle cx="15.5" cy="10.5" r="1.25" fill="#fff"/>
    </svg>
  `;
  toggleBtn.style.position = 'fixed';
  toggleBtn.style.bottom = '24px';
  toggleBtn.style.right = '24px';
  document.body.appendChild(toggleBtn);

  // Notification badge
  const badge = document.createElement('span');
  badge.className = 'cbw-badge';
  badge.style.display = 'none';
  badge.textContent = '1';
  toggleBtn.appendChild(badge);

  // Create chat container
  const container = document.createElement('div');
  container.className = 'cbw-container';
  container.style.display = 'none';
  container.innerHTML = `
    <div class="cbw-header">
      <span>${botName}</span>
      <span class="cbw-header-actions">
        <select class="cbw-agent-selector" id="cbw-agent-selector">
          <option value="">Loading agents...</option>
        </select>
        <select class="cbw-model-selector" id="cbw-model-selector">
          <option value="">Loading models...</option>
        </select>
        <button class="cbw-newchat-btn" id="cbw-newchat">Refresh</button>
        <span style="cursor:pointer;font-weight:normal;" id="cbw-close">×</span>
      </span>
    </div>
    <div class="cbw-messages" id="cbw-messages"></div>
    <form class="cbw-input-row">
      <input class="cbw-input" id="cbw-input" type="text" placeholder="Type your message..." autocomplete="off" />
      <button class="cbw-send-btn" id="cbw-send" type="submit">Send</button>
    </form>
  `;
  document.body.appendChild(container);

  // Load available models
  async function loadModels() {
    try {
      const response = await fetch(`${config.apiHost}/api/models`);
      const models = await response.json();
      
      const modelSelector = document.getElementById('cbw-model-selector');
      modelSelector.innerHTML = '';
      
      models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = model.display_name;
        if (model.id === config.defaultModel) {
          option.selected = true;
        }
        modelSelector.appendChild(option);
      });
      
      // Store models for later use
      config.models = models;
    } catch (error) {
      console.error('Failed to load models:', error);
      // Fallback to default model
      const modelSelector = document.getElementById('cbw-model-selector');
      modelSelector.innerHTML = `<option value="${config.defaultModel}">${config.defaultModel}</option>`;
    }
  }

  // Load available agents
  async function loadAgents() {
    try {
      const response = await fetch(`${config.apiHost}/api/agents`);
      const agents = await response.json();
      
      const agentSelector = document.getElementById('cbw-agent-selector');
      agentSelector.innerHTML = '';
      
      agents.forEach(agent => {
        const option = document.createElement('option');
        option.value = agent.id;
        option.textContent = agent.name;
        option.disabled = !agent.enabled;
        if (agent.id === config.defaultAgent) {
          option.selected = true;
        }
        agentSelector.appendChild(option);
      });
      
      // Store agents for later use
      config.agents = agents;
    } catch (error) {
      console.error('Failed to load agents:', error);
      // Fallback to default agent
      const agentSelector = document.getElementById('cbw-agent-selector');
      agentSelector.innerHTML = `<option value="${config.defaultAgent}">${config.defaultAgent}</option>`;
    }
  }

  // Toggle chat visibility
  function openChat() {
    container.style.display = 'flex';
    toggleBtn.style.display = 'none';
    badge.style.display = 'none';
    setTimeout(() => document.getElementById('cbw-input').focus(), 200);
    unreadCount = 0;
  }
  function closeChat() {
    container.style.display = 'none';
    toggleBtn.style.display = 'flex';
  }
  toggleBtn.onclick = openChat;
  container.querySelector('#cbw-close').onclick = closeChat;

  // New Chat logic
  container.querySelector('#cbw-newchat').onclick = function(e) {
    e.preventDefault();
    // Clear localStorage and in-memory history, show welcome message
    localStorage.removeItem(localStorageKey);
    history = [{ text: welcomeMessage, sender: 'bot' }];
    saveHistory(history);
    renderHistory(history);
  };

  // Chat logic
  const messagesDiv = container.querySelector('#cbw-messages');
  const input = container.querySelector('#cbw-input');
  const sendBtn = container.querySelector('#cbw-send');
  let sending = false;
  let unreadCount = 0;

  // Load history from localStorage
  function loadHistory() {
    const raw = localStorage.getItem(localStorageKey);
    if (!raw) return [];
    try {
      return JSON.parse(raw) || [];
    } catch {
      return [];
    }
  }
  function saveHistory(history) {
    localStorage.setItem(localStorageKey, JSON.stringify(history));
  }

  // Dynamically load marked.js and DOMPurify
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Dynamically load MathJax
  function loadMathJax() {
    return new Promise((resolve, reject) => {
      if (window.MathJax) return resolve();
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Wait for marked.js, DOMPurify, MathJax before rendering any messages
  let markdownReady = false;
  let marked, DOMPurify;
  Promise.all([
    loadScript('https://cdn.jsdelivr.net/npm/marked/marked.min.js'),
    loadScript('https://cdn.jsdelivr.net/npm/dompurify@3.0.8/dist/purify.min.js'),
    loadMathJax()
  ]).then(() => {
    marked = window.marked;
    DOMPurify = window.DOMPurify;
    markdownReady = true;
    if (typeof renderHistory === 'function' && typeof history !== 'undefined') {
      renderHistory(history);
    }
  });

  // After a message is appended, typeset MathJax if available
  function typesetMathJax(target) {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([target]);
    }
  }

  // Render message with Markdown, XSS protection, and MathJax
  function renderMessage(text) {
    if (markdownReady && marked && DOMPurify) {
      const dirty = marked.parse(text);
      const clean = DOMPurify.sanitize(dirty);
      const div = document.createElement('div');
      div.innerHTML = clean;
      typesetMathJax(div);
      return div;
    } else {
      // Fallback: plain text with links and line breaks
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const html = text
        .replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`)
        .replace(/\n/g, '<br>');
      const div = document.createElement('div');
      div.innerHTML = html;
      return div;
    }
  }

  // Feedback logic - only for bot messages after the first one
  function addFeedback(msgDiv, idx, history) {
    // Don't add feedback to the first message (welcome message)
    if (idx === 0) return;
    
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'cbw-feedback';
    const upBtn = document.createElement('button');
    upBtn.className = 'cbw-feedback-btn up';
    upBtn.textContent = '👍';
    const downBtn = document.createElement('button');
    downBtn.className = 'cbw-feedback-btn down';
    downBtn.textContent = '👎';
    feedbackDiv.appendChild(upBtn);
    feedbackDiv.appendChild(downBtn);
    msgDiv.appendChild(feedbackDiv);
    
    async function sendFeedback(value) {
      try {
        const selectedModelId = document.getElementById('cbw-model-selector').value || config.defaultModel;
        const selectedAgentId = document.getElementById('cbw-agent-selector').value || config.defaultAgent;
        // Get the actual model name from the models list
        const selectedModel = config.models.find(m => m.id === selectedModelId)?.name || selectedModelId;
        
        const requestBody = {
          message: history[idx].text,
          ai_provider: selectedModel,
          agent_id: selectedAgentId,
          useful: value === 1 ? true : false
        };
        
        await fetch(`${config.apiHost}/api/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
        
        console.log('Feedback sent for message', idx, value);
      } catch (error) {
        console.error('Failed to send feedback:', error);
      }
    }
    
    function select(btn, value) {
      upBtn.classList.toggle('selected', value === 1);
      downBtn.classList.toggle('selected', value === -1);
      upBtn.classList.toggle('up', true);
      downBtn.classList.toggle('down', true);
      // Save feedback in history
      history[idx].feedback = value;
      saveHistory(history);
      // Send feedback immediately
      sendFeedback(value);
    }
    
    upBtn.onclick = function(e) { e.preventDefault(); select(upBtn, 1); };
    downBtn.onclick = function(e) { e.preventDefault(); select(downBtn, -1); };
    
    // Restore feedback state
    if (history[idx].feedback === 1) { upBtn.classList.add('selected', 'up'); }
    if (history[idx].feedback === -1) { downBtn.classList.add('selected', 'down'); }
  }

  // Append message to chat
  function appendMessage(text, sender, history, idx) {
    const msg = document.createElement('div');
    msg.className = 'cbw-message ' + sender;
    const content = renderMessage(text);
    msg.appendChild(content);
    // For user messages, wrap in a right-aligned container
    if (sender === 'user') {
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.justifyContent = 'flex-end';
      wrapper.appendChild(msg);
      messagesDiv.appendChild(wrapper);
    } else {
      // For bot and loading messages, left align
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.justifyContent = 'flex-start';
      wrapper.appendChild(msg);
      messagesDiv.appendChild(wrapper);
      if (sender === 'bot') addFeedback(msg, idx, history);
    }
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    // typeset last message bubble
    setTimeout(() => {
      const bubbles = messagesDiv.querySelectorAll('.cbw-message');
      if (bubbles.length > 0) typesetMathJax(bubbles[bubbles.length - 1]);
    }, 0);
  }

  // Render all messages
  function renderHistory(history) {
    messagesDiv.innerHTML = '';
    history.forEach((m, idx) => {
      appendMessage(m.text, m.sender, history, idx);
    });
  }

  // Initial load
  let history = loadHistory();
  if (history.length === 0) {
    // Show welcome message
    history.push({ text: welcomeMessage, sender: 'bot' });
    saveHistory(history);
  }
  renderHistory(history);

  // Send message
  async function sendMessage(e) {
    e.preventDefault();
    if (!input.value.trim() || sending) return;
    
    const userMsg = input.value.trim();
    const selectedModelId = document.getElementById('cbw-model-selector').value || config.defaultModel;
    const selectedAgentId = document.getElementById('cbw-agent-selector').value || config.defaultAgent;
    
    // Get the actual model name from the models list
    const selectedModel = config.models.find(m => m.id === selectedModelId)?.name || selectedModelId;
    
    history.push({ text: userMsg, sender: 'user' });
    saveHistory(history);
    appendMessage(userMsg, 'user', history, history.length - 1);
    input.value = '';
    sending = true;
    sendBtn.disabled = true;
    
    // Show loading
    history.push({ text: '...', sender: 'bot' });
    saveHistory(history);
    appendMessage('...', 'bot', history, history.length - 1);
    
    try {
      const requestBody = {
        message: userMsg,
        ai_provider: selectedModel,
        agent_id: selectedAgentId
      };
      
      const res = await fetch(`${config.apiHost}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const data = await res.json();
      // Remove the '...' loading message
      history.pop();
      messagesDiv.removeChild(messagesDiv.lastChild);
      
      if (data && data.response) {
        history.push({ text: data.response, sender: 'bot' });
        saveHistory(history);
        appendMessage(data.response, 'bot', history, history.length - 1);
        // If chat is closed, show notification badge
        if (container.style.display === 'none') {
          unreadCount++;
          badge.textContent = unreadCount;
          badge.style.display = 'flex';
        }
      } else {
        history.push({ text: 'Sorry, no response from server.', sender: 'bot' });
        saveHistory(history);
        appendMessage('Sorry, no response from server.', 'bot', history, history.length - 1);
      }
    } catch (err) {
      history.pop();
      messagesDiv.removeChild(messagesDiv.lastChild);
      history.push({ text: 'Error connecting to chatbot.', sender: 'bot' });
      saveHistory(history);
      appendMessage('Error connecting to chatbot.', 'bot', history, history.length - 1);
    }
    sending = false;
    sendBtn.disabled = false;
  }

  container.querySelector('form').onsubmit = sendMessage;
  
  // Load models when widget is ready
  loadModels();
  loadAgents();
})(); 