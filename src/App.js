import logo from './logo.svg';
import './App.css';
import { useEffect, useState, useCallback } from 'react'
import { throttle } from 'lodash';

const NETWORK_STATUS = {
  pending: 'LOADING',
  error: 'ERROR',
  success: 'SUCCESS', 
  notstarted: 'NOT_STARTED', 

}
const NETWORK_STATUS_TEXT = {
  LOADING: 'Loading',
  ERROR: '❌',
  SUCCESS: '✅',
  NOT_STARTED: '',

}

const buttonCss = {
  padding: '8px 16px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
}

const styles = {
  codeEditor: {
    border: '1px solid #ccc',
    borderRadius: '4px',
    margin: '20px'
  },
  header: {
    padding: '10px',
    borderBottom: '1px solid #ccc',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  runButton: {
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  body: {
    width: '100%',
    minHeight: '200px',
    padding: '10px',
    border: 'none',
    resize: 'vertical',
    boxSizing: "border-box",
  },
  footer: {
    padding: '10px',
    borderTop: '1px solid #ccc',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    justifyContent: 'space-between'
  },
  resultContainer: {
    maxWidth: '45%',
    display: 'flex',
    alignItems: 'center',
    flex: '1',
  },
  resultContainerRight: {
    maxWidth: '45%',
    display: 'flex',
    alignItems: 'center',
    flex: '1',
    justifyContent: 'flex-end'
  },
  resultText: {
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    display: 'block',
    textAlign: 'left',
    paddingLeft: '10px',
    flex: '1'
  },
  resultTextError: {
    color: 'red'
  },
  // Add new style for app header
  appHeader: {
    textAlign: 'center',
    padding: '10px',
    fontSize: '12px',
    fontWeight: 'bold',
    borderBottom: '1px solid #ccc',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  headerLogo: {
    height: '24px',
    width: 'auto',
  },
  spinner: {
    display: 'inline-block',
    width: '10px',
    height: '10px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #3498db',
    borderLeft: '3px solid #3498db',
    borderBottom: '3px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginLeft: '4px',
    verticalAlign: 'middle',
  },
  resultOutput: {
    width: '100%',
    minHeight: '100px',
    padding: '10px',
    border: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
    marginTop: '10px',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    overflow: 'auto',
    textAlign: 'left'
  },
};

// Add keyframes animation to the App.css file or add it inline in the component
const spinnerKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function CodeEditor({ onChange, onClick, statsRes, runRes, bodyText, statsNetworkStatus, runNetworkStatus, onDelete }) {
  const handleKeyDown = (e) => {
    // Check for Command+Enter (Mac) or Control+Enter (Windows)
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault(); // Prevent default behavior
      onClick(); // Call the run function
    }
  };

  return (
    <div style={styles.codeEditor}>
      <style>{spinnerKeyframes}</style>
      <div style={styles.header}>
        <button onClick={onDelete} style={{...styles.runButton, backgroundColor: '#dc3545', marginRight: 'auto'}}>
          delete
        </button>
        <button onClick={onClick} style={styles.runButton}>
          run code
        </button>
      </div>
      <div>
      <textarea
        style={styles.body}
        value={bodyText}
        onChange={onChange}
        onKeyDown={handleKeyDown}
      />
      <div style={styles.footer}>
        <span style={styles.resultContainer}>
          Stats: {statsNetworkStatus === NETWORK_STATUS.pending ? 
            <div style={styles.spinner} /> : 
            <span 
              style={styles.resultText} 
              title={statsRes}
            >
              {statsRes}
            </span>}
        </span> 
        <span style={styles.resultContainerRight}>
          {runNetworkStatus === NETWORK_STATUS.pending ? 
            <div style={styles.spinner} /> : 
            <span 
              style={{
                ...styles.resultText,
                ...(runNetworkStatus === NETWORK_STATUS.error && styles.resultTextError),
                textAlign: 'right',
              }}
              title={NETWORK_STATUS_TEXT[runNetworkStatus]}
            >
              {NETWORK_STATUS_TEXT[runNetworkStatus]}
            </span>}
        </span>
      </div>
      <pre style={styles.resultOutput}>
        {runRes}
      </pre>
      </div>
    </div>
  );
}




const fetchStats = throttle(async (text) => {
  try {
    const response = await fetch('http://127.0.0.1:8081/stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return await response.json();

  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}, 500);

const fetchRun = async (text) => {
  try {
    const response = await fetch('http://127.0.0.1:8081/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return await response.json();

  } catch (error) {
    console.error('Error fetching run:', error);
    throw error;
  }
};

function App() {
  const [editors, setEditors] = useState({})

  useEffect(() => {
    // const newEditor = createEditor()
    // setEditors(prev => ({
    //   ...prev,
    //   [newEditor.id]: newEditor
    // }))
  }, [])

  const createEditor = () => {
    return {
      id: crypto.randomUUID(),
      statsState: NETWORK_STATUS.notstarted,
      runState: NETWORK_STATUS.notstarted,
      text: '',
      statsRes: '',
      runRes: ''
    }
  }

  const updateEditorState = (editorId, updates) => {
    setEditors(prevEditors => ({
      ...prevEditors,
      [editorId]: {
        ...prevEditors[editorId],
        ...updates
      }
    }))
  }

  const handleEditorChange = useCallback(async (editorObj, value) => {
    console.log("e", value);
    updateEditorState(editorObj.id, {
      text: value,
      statsState: NETWORK_STATUS.pending
    });
    try {
      const res = await fetchStats(value);
      updateEditorState(editorObj.id, {
        statsRes: res.word_count,
        statsState: NETWORK_STATUS.success
      });
    } catch(e) {
      updateEditorState(editorObj.id, {
        statsRes: 'Network error',
        statsState: NETWORK_STATUS.error
      });
    }
  }, []);

  const handleEditorRun = useCallback(async (editorObj) => {
    updateEditorState(editorObj.id, {
      runState: NETWORK_STATUS.pending
    });
    try {
      if (editorObj.runState === NETWORK_STATUS.pending) return
      const res = await fetchRun(editorObj.text);
      console.log('res', res);
      updateEditorState(editorObj.id, {
        runRes: res.result,
        runState: NETWORK_STATUS.success
      });
    } catch(e) {
      updateEditorState(editorObj.id, {
        runRes: 'error',
        runState: NETWORK_STATUS.error
      });
    }
  }, []);

  const handleEditorDelete = useCallback((editorId) => {
    setEditors(prevEditors => {
      const newEditors = { ...prevEditors };
      delete newEditors[editorId];
      return newEditors;
    });
  }, []);

  return (
    <div className="App">
      <div style={styles.appHeader}>
        <img src="/logo-1.webp" alt="Fabi AI Logo" style={styles.headerLogo} />
        Fabi AI
      </div>
      <div>
        {
          Object.values(editors).map(editorObj => {
            return (
              <CodeEditor
                key={editorObj.id}
                onChange={(e) => handleEditorChange(editorObj, e.target.value)}
                onClick={() => handleEditorRun(editorObj)}
                onDelete={() => handleEditorDelete(editorObj.id)}
                statsRes={editorObj.statsRes}
                runRes={editorObj.runRes}
                bodyText={editorObj.text}
                statsNetworkStatus={editorObj.statsState}
                runNetworkStatus={editorObj.runState}
              />
            )
          })
        }
  
      </div>
      <button onClick={() => {
        const newEditor = createEditor()
        setEditors(prev => ({
          ...prev,
          [newEditor.id]: newEditor
        }))
      }} style={buttonCss}>
        Add code editor
      </button>
    </div>
  );
}

export default App;
