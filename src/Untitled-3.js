import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react'
import { throttle } from 'lodash';

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
    resize: 'vertical'
  },
  footer: {
    padding: '10px',
    borderTop: '1px solid #ccc',
    backgroundColor: '#f5f5f5'
  },
  header: {
    padding: '10px',
    borderBottom: '1px solid #ccc',
    display: 'flex',
    justifyContent: 'flex-end',
    
  },
  // Add new style for app header
  appHeader: {
    textAlign: 'center',
    padding: '10px',
    fontSize: '12px',
    fontWeight: 'bold',
    borderBottom: '1px solid #ccc',
    marginBottom: '10px',
  },
};


function CodeEditor({ onChange, onClick, footerText, bodyText }) {

  return (
    <div style={styles.codeEditor}>
      <div style={styles.header}>
        <button onClick={onClick} style={styles.runButton}>
          run code
        </button>
      </div>
      <textarea
        style={styles.body}
        value={bodyText}
        onChange={onChange}
      />
      <div style={styles.footer}>
        {footerText}
      </div>
    </div>
  );
}


const NETWORK_STATUS = {
  pending: 'LOADING',
  error: 'ERROR',
  success: 'SUCCESS', 
  notstarted: 'NOT_STARTED', 

}

const fetchStats = throttle(async (text) => {
  console.log('fetch', text)
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

  return (
    <div className="App">
      <div style={styles.appHeader}>Fabi AI</div>
      <div>
        {
          Object.values(editors).map(editorObj => {
            return (
              <CodeEditor
                onChange={async (e) => {
                  console.log("e", e.target.value)
                  updateEditorState(editorObj.id, {
                    text: e.target.value,
                    statsState: NETWORK_STATUS.pending
                  })
                  try {

                    const res = await fetchStats(e.target.value)
                    updateEditorState(editorObj.id, {
                      statsRes: res.word_count,
                      statsState: NETWORK_STATUS.success
                    })
                  } catch(e) {
                    updateEditorState(editorObj.id, {
                      statsRes: 'error',
                      statsState: NETWORK_STATUS.error
                    })
                  }
                }}
                onClick={() => console.log('Running code')}
                footerText={editorObj.statsRes}
                bodyText={editorObj.texgt}
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
