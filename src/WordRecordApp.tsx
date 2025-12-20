import { WordRecordWindow } from "./components/WordRecordWindow";
import "./styles.css";

function WordRecordApp() {
  return (
    <div
      className="h-screen w-screen"
      style={{
        backgroundColor: "#f9fafb",
        margin: 0,
        padding: 0,
        height: "100vh",
        width: "100vw",
      }}
    >
      <WordRecordWindow />
    </div>
  );
}

export default WordRecordApp;

