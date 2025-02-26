import ChatBot from "@/components/ChatBot";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-200">
      <main className="w-full max-w-md">
        <ChatBot />
      </main>
      <footer className="text-center text-sm text-gray-500 py-4">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://marble-border-52d.notion.site/Where-All-Belong-Belonging-03ac1be004554b1ebb7bec887c167524?pvs=4"
          target="_blank"
          rel="noopener noreferrer"
        >
          Where all belong
        </a>
      </footer>
    </div>
  );
}
