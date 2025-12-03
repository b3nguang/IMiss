import { JsonFormatterWindow } from "./components/JsonFormatterWindow";
import "./styles.css";

function JsonFormatterApp() {
  return (
    <div 
      className="h-screen w-screen" 
      style={{ 
        backgroundColor: '#f9fafb', 
        margin: 0, 
        padding: 0,
        height: '100vh',
        width: '100vw',
      }}
    >
      <JsonFormatterWindow />
    </div>
  );
}

export default JsonFormatterApp;

