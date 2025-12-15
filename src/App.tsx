import { Provider } from 'react-redux'
import { store } from './redux/store'
import './App.css'
import GanttComponent from './components/GanttComponent'

function App() {
  return (
    <Provider store={store}>
      <div style={{ height: '100vh', width: '95vw' }}>
        <GanttComponent />
      </div>
    </Provider>
  )
}

export default App
