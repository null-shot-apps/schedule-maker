'use client';

import { useEffect, useState } from 'react';

type Activity = {
  id: string;
  title: string;
  day: string;
  time: string;
  completed: boolean;
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ScheduleMaker() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [newActivity, setNewActivity] = useState({ title: '', time: '' });
  const [showReminder, setShowReminder] = useState(false);
  const [reminderText, setReminderText] = useState('');

  // Load activities from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('weeklyActivities');
    if (saved) {
      setActivities(JSON.parse(saved));
    }
  }, []);

  // Save activities to localStorage
  useEffect(() => {
    if (activities.length > 0) {
      localStorage.setItem('weeklyActivities', JSON.stringify(activities));
    }
  }, [activities]);

  // Check for reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentDay = DAYS[now.getDay() === 0 ? 6 : now.getDay() - 1];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const upcomingActivities = activities.filter(
        activity => activity.day === currentDay && activity.time === currentTime && !activity.completed
      );

      if (upcomingActivities.length > 0) {
        setReminderText(`Reminder: ${upcomingActivities.map(a => a.title).join(', ')}`);
        setShowReminder(true);
        setTimeout(() => setShowReminder(false), 5000);
      }
    };

    const interval = setInterval(checkReminders, 60000);
    checkReminders(); // Check immediately
    return () => clearInterval(interval);
  }, [activities]);

  const addActivity = () => {
    if (newActivity.title && newActivity.time) {
      const activity: Activity = {
        id: Date.now().toString(),
        title: newActivity.title,
        day: selectedDay,
        time: newActivity.time,
        completed: false,
      };
      setActivities([...activities, activity]);
      setNewActivity({ title: '', time: '' });
    }
  };

  const toggleComplete = (id: string) => {
    setActivities(activities.map(a => 
      a.id === id ? { ...a, completed: !a.completed } : a
    ));
  };

  const deleteActivity = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const todayActivities = activities
    .filter(a => a.day === selectedDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 md:p-8">
      {/* Reminder Notification */}
      {showReminder && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-400 text-black px-6 py-4 rounded-lg shadow-2xl animate-bounce">
          <p className="font-bold">🔔 {reminderText}</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-8">
          📅 Weekly Activity Scheduler
        </h1>

        {/* Day Selector */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedDay === day
                    ? 'bg-purple-600 text-white scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Add Activity Form */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Activity for {selectedDay}</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Activity title"
              value={newActivity.title}
              onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-800"
            />
            <input
              type="time"
              value={newActivity.time}
              onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-800"
            />
            <button
              onClick={addActivity}
              className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Activities List */}
        <div className="bg-white rounded-xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {selectedDay}'s Schedule ({todayActivities.length})
          </h2>
          {todayActivities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No activities scheduled for this day</p>
          ) : (
            <div className="space-y-3">
              {todayActivities.map(activity => (
                <div
                  key={activity.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                    activity.completed
                      ? 'bg-green-50 border-green-300'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={activity.completed}
                    onChange={() => toggleComplete(activity.id)}
                    className="w-6 h-6 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className={`font-semibold text-lg ${activity.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600">{activity.time}</p>
                  </div>
                  <button
                    onClick={() => deleteActivity(activity.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

