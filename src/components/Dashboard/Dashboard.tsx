import { useDashboardStore } from '../../store/dashboardStore';
import Sidebar from './Sidebar';
import Notes from './Notes';
import Calendar from './Calendar';
import Tasks from './Tasks';
import Chatbot from './Chatbot';

export default function Dashboard() {
  const { activeSection } = useDashboardStore();

  const renderSection = () => {
    switch (activeSection) {
      case 'Notes':
        return <Notes />;
      case 'Calendar':
        return <Calendar />;
      case 'Tasks':
        return <Tasks />;
      case 'LeetCode':
        return (
          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 text-white">LeetCode Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-gray-400">
                <span>Problems Solved</span>
                <span>150</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Contest Rating</span>
                <span>1800</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Global Ranking</span>
                <span>#50,000</span>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 text-white">{activeSection}</h2>
            <p className="text-gray-400">Coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-900">
        {renderSection()}
      </main>
      <div className="fixed bottom-0 left-64 right-0">
        <Chatbot />
      </div>
    </div>
  );
}