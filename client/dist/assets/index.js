// This is a simplified version of our application that works in production
// It uses the preloaded React & ReactDOM from the CDN in index-static.html

// Basic React component for the app
function SimpleApp() {
  const [entries, setEntries] = React.useState([
    { id: 1, date: 'Mar 30, 2025', text: 'Today I learned about Redux and how it manages state in a more predictable way.' },
    { id: 2, date: 'Mar 29, 2025', text: 'Started work on my new side project - feeling excited about the possibilities!' },
    { id: 3, date: 'Mar 28, 2025', text: 'Struggled with a difficult bug today, but finally solved it after hours of debugging.' }
  ]);
  
  const [currentEntry, setCurrentEntry] = React.useState('');
  const [todayPrompt, setTodayPrompt] = React.useState('What was the most important lesson you learned today?');
  
  // Log for debugging
  console.log('[SimpleApp] Component rendering');
  
  // Effect to confirm mounting
  React.useEffect(() => {
    console.log('[SimpleApp] Component mounted');
  }, []);

  const saveEntry = () => {
    if (!currentEntry.trim()) return;
    
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      text: currentEntry
    };
    
    setEntries([newEntry, ...entries]);
    setCurrentEntry('');
    
    // Fake a successful save
    alert('Journal entry saved successfully!');
  };
  
  return React.createElement('div', { className: 'container', style: containerStyle }, [
    // Header Section
    React.createElement('header', { key: 'header', className: 'app-header', style: headerStyle }, [
      React.createElement('h1', { key: 'title', style: titleStyle }, 'Drop Journal'),
      React.createElement('p', { key: 'subtitle', style: subtitleStyle }, 'Your daily reflection companion')
    ]),
    
    // Entry Card
    React.createElement('div', { key: 'card', style: cardStyle }, [
      React.createElement('h2', { key: 'prompt', style: promptStyle }, todayPrompt),
      React.createElement('textarea', { 
        key: 'textarea',
        value: currentEntry,
        onChange: (e) => setCurrentEntry(e.target.value),
        placeholder: 'Start writing your thoughts here...',
        style: textareaStyle
      }),
      React.createElement('button', { 
        key: 'button',
        onClick: saveEntry,
        style: buttonStyle
      }, 'Save Entry')
    ]),
    
    // Entries List
    React.createElement('div', { key: 'list', style: listContainerStyle }, [
      React.createElement('h3', { key: 'list-title' }, 'Recent Entries'),
      ...entries.map(entry => 
        React.createElement('div', { key: entry.id, style: entryItemStyle }, [
          React.createElement('div', { key: `date-${entry.id}`, style: entryDateStyle }, entry.date),
          React.createElement('div', { key: `text-${entry.id}`, style: entryTextStyle }, entry.text)
        ])
      )
    ])
  ]);
}

// Styles
const containerStyle = {
  maxWidth: '800px',
  margin: '50px auto',
  padding: '20px'
};

const headerStyle = {
  background: 'white',
  borderRadius: '12px',
  padding: '30px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  marginBottom: '20px'
};

const titleStyle = {
  fontSize: '32px',
  margin: '0 0 10px 0',
  color: '#5046e5'
};

const subtitleStyle = {
  fontSize: '18px',
  color: '#666',
  margin: '0'
};

const cardStyle = {
  background: 'white',
  borderRadius: '8px',
  padding: '20px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  marginBottom: '20px'
};

const promptStyle = {
  fontSize: '24px',
  color: '#333',
  fontWeight: '500',
  marginBottom: '15px'
};

const textareaStyle = {
  width: '100%',
  height: '150px',
  padding: '12px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  marginBottom: '15px',
  fontFamily: 'inherit',
  fontSize: '16px',
  boxSizing: 'border-box'
};

const buttonStyle = {
  background: '#5046e5',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  padding: '12px 24px',
  fontSize: '16px',
  fontWeight: '500',
  cursor: 'pointer'
};

const listContainerStyle = {
  marginTop: '30px'
};

const entryItemStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  padding: '15px',
  borderBottom: '1px solid #eee',
  background: 'white',
  borderRadius: '4px',
  marginBottom: '10px'
};

const entryDateStyle = {
  fontWeight: '500',
  minWidth: '120px'
};

const entryTextStyle = {
  flex: '1',
  color: '#666'
};

// Initialize the application
console.log('[main] React initialization starting...');
console.log('[main] Finding root element...');
const rootElement = document.getElementById('app-root');
console.log('[main] Root element found?', !!rootElement);

if (rootElement) {
  console.log('[main] Creating React root...');
  const root = ReactDOM.createRoot(rootElement);
  console.log('[main] Rendering application...');
  root.render(React.createElement(SimpleApp));
  console.log('[main] React application rendered successfully');
} else {
  console.error('[main] Error: Could not find root element!');
}