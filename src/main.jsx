import REACTDOM from 'react-dom/client'
import App from './App.jsx'

{/*This is the main entry point of the app. It imports the necessary components and renders the application to the DOM.*/}

 
REACTDOM.createRoot(document.getElementById('root')).render(
<App />
)
